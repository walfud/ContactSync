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
        name: { type: GraphQLString },
        phones: { type: new GraphQLList(GraphQLString) },
        last_update: { type: GraphQLLong },
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
        name: { type: new GraphQLNonNull(GraphQLString) },
        phones: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
        last_update: { type: GraphQLLong },
    }
});
const SyncDataInputType = new GraphQLInputObjectType({
    name: 'SyncDataInputType',
    fields: {
        adds: { type: new GraphQLList(ContactInputType) },
        mods: { type: new GraphQLList(ContactInputType) },
        dels: { type: new GraphQLList(ContactInputType) },
    }
});
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        sync: {
            type: new GraphQLList(ContactType),
            args: {
                token: { type: new GraphQLNonNull(GraphQLString) },
                contacts: { type: new GraphQLNonNull(SyncDataInputType) },
            },
            async resolve(source, { token, contacts: { adds: clientAdds, mods: clientMods, dels: clientDels } }) {
                const oid = await network.getOauthId(token);
                const user = await UserModel.findOne({ oid });
                let serverContacts = [];
                if (user) {
                    serverContacts = user.contacts;
                }

                // First handle deleted contacts
                console.log(clientDels);
                clientDels.forEach((del) => {
                    const index = _.findIndex(serverContacts, serverContact => isSameContact(serverContact, del));
                    if (index != -1) {
                        console.log(`delete: ${util.inspect(del)}`);

                        serverContacts[index] = del;
                        serverContacts[index].is_deleted = true;
                    }
                });

                // // Then, modifieds'
                // const modContacts = (clientMods || []).map(({ "new": mod, old: oldContact }) => clientContacts[mod]);
                // console.log(modContacts);
                // (clientMods || []).forEach(({ mod, oldContact }) => {
                //     const modContact = clientContacts[mod];
                //     const index = _.findIndex(serverContacts.map(serverContact => isSameContact(serverContact, oldContact)));
                //     if (index != -1) {
                //         console.log(`modify: ${util.inspect(oldContact)} => ${util.inspect(modContact)}`);
                //         console.log(`add: ${util.inspect(addContact)}`);

                //         serverContacts[index] = modContact;
                //     }
                // });

                // // Finally Addeds'
                // console.log(clientAdds);
                // clientAdds.forEach((add) => {
                //     const index = _.findIndex(serverContacts, serverContact => isSameContact(serverContact, add));
                //     if (index == -1) {
                //         console.log(`add: ${util.inspect(add)}`);

                //         serverContacts.push(add);
                //     }
                // });

                await UserModel.update({ oid }, { $set: { contacts: serverContacts } }, { upsert: true });

                return serverContacts;
            }
        }
    },
});

async function getContacts(token) {
    const oid = await network.getOauthId(token);
    return UserModel.findOne({ oid }).exec().then(user => user ? user.contacts : []);
}

function isSameContact({ nameA, phonesA }, { nameB, phonesB }) {
    return nameA == nameB && _.isEqual(phonesA, phonesB);
}

/**
 * `before` & `after`:
 *  1. is same contact
 *  2. later's update time is greater than front one
 * 
 */
function isModifiedAfter(before, after) {
    return isSameContact(before, after) && before.lastUpdate > after.lastUpdate;
}


// function tidy() {}

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});

module.exports = schema;