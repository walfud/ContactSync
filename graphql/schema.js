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
        contacts: { type: new GraphQLList(ContactInputType) },
    }
});
const SyncOutputType = new GraphQLObjectType({
    name: 'SyncOutputType',
    fields: {
        contacts: { type: new GraphQLList(ContactType) },
    }
});
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        /**
         * 
         */
        sync: {
            type: SyncOutputType,
            args: {
                token: { type: new GraphQLNonNull(GraphQLString) },
                contacts: { type: new GraphQLNonNull(new GraphQLList(ContactInputType)) },
            },
            async resolve(source, { token, contacts: clientContacts }) {
                const oid = await network.getOauthId(token);
                const user = await UserModel.findOne({ oid }) || {};
                const serverContacts = user.contacts || [];
                const retContacts = [];
                clientContacts.forEach(clientContact => {
                    let index = _.findIndex(serverContacts, serverContact => serverContact.id == clientContact.id);
                    if (index == -1) {
                        index = _.findIndex(serverContacts, serverContact => isSameContact(serverContact, clientContact));
                        if (index != -1) {
                            // Fill id
                            clientContact.id = serverContacts[index].id;
                        }
                    }

                    if (index != -1) {
                        // Modify existing
                        if (!isSame(serverContacts[index], clientContact)) {
                            console.log(`modify: ${util.inspect(serverContacts[index])} => ${util.inspect(clientContact)}`);
                            serverContacts[index] = clientContact;
                        }
                        retContacts.push(serverContacts[index]);
                    } else {
                        // Add to db
                        console.log(`add: ${util.inspect(clientContact)}`);
                        clientContact.id = clientContact.name;   // DEBUG: uuidV4()   
                        serverContacts.push(clientContact);
                        retContacts.push(serverContacts[serverContacts.length - 1]);
                    }
                });

                // await UserModel.update({ oid }, { $set: { contacts: serverContacts } }, { upsert: true });

                const diffContacts = _.difference(serverContacts, retContacts);
                retContacts.push(...diffContacts);

                return {
                    contacts: retContacts,
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

function isSame(a, b) {
    return a.id == b.id
        && a.name == b.name
        && _.isEqual(a.phones, b.phones)
        && a.modify_time == b.modify_time
        && a.is_deleted == b.is_deleted;
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