const {
    GraphQLBoolean,
    GraphQLEnumType,
    GraphQLFloat,
    GraphQLID,
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLInterfaceType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLSchema,
    GraphQLString,
    GraphQLUnionType,
} = require('graphql');
const GraphQLLong = require('graphql-type-long');
const uuidV4 = require('uuid/v4');
const _ = require('underscore');
const util = require('util');

const UserModel = require('../services/db').UserModel;
const network = require('../services/network');

const ContactType = new GraphQLObjectType({
    name: 'ContactType',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        phones: { type: new GraphQLList(GraphQLString) },
        modify_time: { type: GraphQLLong },
        is_deleted: { type: GraphQLBoolean },
    }
});
const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        contacts: {
            type: new GraphQLList(ContactType),
            args: {
                token: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(source, { token }) {
                return await getContacts(token);
            }
        },
    },
});

const ContactInputType = new GraphQLInputObjectType({
    name: 'ContactInputType',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        phones: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
        modify_time: { type: GraphQLLong },
        is_deleted: { type: GraphQLBoolean },
    }
});
const SyncDataInputType = new GraphQLInputObjectType({
    name: 'SyncDataInputType',
    fields: {
        want_adds: { type: new GraphQLList(ContactInputType) },
        want_mods: { type: new GraphQLList(ContactInputType) },
        want_dels: { type: new GraphQLList(ContactInputType) },
        unchanges: { type: new GraphQLList(ContactInputType) },
    }
});
const SyncOutputType = new GraphQLObjectType({
    name: 'SyncOutputType',
    fields: {
        to_fills: { type: new GraphQLList(GraphQLID) },
        to_adds: { type: new GraphQLList(ContactType) },
        to_mods: { type: new GraphQLList(ContactType) },
        to_dels: { type: new GraphQLList(ContactType) },
    }
});
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        sync: {
            type: SyncOutputType,
            args: {
                token: { type: new GraphQLNonNull(GraphQLString) },
                contacts: { type: new GraphQLNonNull(SyncDataInputType) },
            },
            async resolve(source, { token, contacts: { want_adds: clientAdds, want_mods: clientMods, want_dels: clientDels, unchanges: clientUnchanges } }) {
                const oid = await network.getOauthId(token);
                const user = await UserModel.findOne({ oid }) || {};
                const serverContacts = user.contacts || [];
                const clientContacts = [];
                const to_fills = [];
                console.log(clientAdds);
                clientAdds.forEach(add => {
                    const index = _.findIndex(serverContacts.filter(serverContact => !serverContact.is_deleted), serverContact => isSameContact(serverContact, add));
                    if (index == -1) {
                        console.log(`add: ${util.inspect(add)}`);
                        const id = add.name;      // DEBUG: uuidV4()
                        add.id = id;
                        add.is_deleted = false;
                        serverContacts.push(add);
                        clientContacts.push(serverContacts[serverContacts.length-1]);
                        to_fills.push(id);
                    } else {
                        clientContacts.push(serverContacts[index]);
                        to_fills.push(serverContacts[index].id);
                    }
                });

                console.log(clientMods);
                (clientMods || []).forEach(mod => {
                    const index = _.findIndex(serverContacts, serverContact => serverContact.id == mod.id);
                    if (index != -1) {
                        console.log(`modify: ${util.inspect(serverContacts[index])} => ${util.inspect(mod)}`);

                        serverContacts[index] = mod;
                        clientContacts.push(serverContacts[index]);
                    } else {
                        console.warn(`WRONG: modify: id(${mod.id})`);
                    }
                });

                console.log(clientDels);
                clientDels.forEach(del => {
                    const index = _.findIndex(serverContacts, serverContact => serverContact.id == del.id);
                    if (index != -1) {
                        console.log(`delete: ${util.inspect(serverContacts[index])}`);

                        serverContacts[index].is_deleted = true;
                        clientContacts.push(serverContacts[index]);
                    } else {
                        console.warn(`WRONG: delete: id(${del.id})`);
                    }
                });

                // 
                console.log(clientUnchanges);
                const to_adds = [], to_mods = [], to_dels = [];
                const diffServerContacts = _.difference(serverContacts, clientContacts);
                diffServerContacts.forEach(diffServerContact => {
                    const index = _.findIndex(clientUnchanges, unchange => unchange.id == diffServerContact.id);
                    if (index == -1) {
                        // Add to client 
                        to_adds.push(diffServerContact);
                    } else {
                        // Sync to client
                        if (!diffServerContact.is_deleted) {
                            if (!isSameContact(diffServerContact, clientUnchanges[index])) {
                                // Modify client
                                to_mods.push(diffServerContact);
                            }
                        } else {
                            // Delete client
                            to_dels.push(diffServerContact);
                        }
                    }
                })

                // await UserModel.update({ oid }, { $set: { contacts: serverContacts } }, { upsert: true });

                return {
                    to_fills,
                    to_adds,
                    to_mods,
                    to_dels,
                };
            }
        }
    },
});

async function getContacts(token) {
    const oid = await network.getOauthId(token);
    return UserModel.findOne({ oid }).exec().then(user => user ? user.contacts : []);
}

function isSameContact({ name: nameA, phones: phonesA }, { name: nameB, phones: phonesB }) {
    return nameA == nameB && _.isEqual(phonesA, phonesB);
}

/**
 * `before` & `after`:
 *  1. is same contact
 *  2. later's update time is greater than front one
 * 
 */
function isModifiedAfter(before, after) {
    return isSameContact(before, after) && before.modify_time > after.modify_time;
}


// function tidy() {}

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});

module.exports = schema;