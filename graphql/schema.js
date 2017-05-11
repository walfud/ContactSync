const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLEnumType = require('graphql').GraphQLEnumType;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLID = require('graphql').GraphQLID;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLScalarType = require('graphql').GraphQLScalarType;
const GraphQLSchema = require('graphql').GraphQLSchema;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLUnionType = require('graphql').GraphQLUnionType;
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
        last_update: { type: GraphQLInt },
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
        last_update: { type: GraphQLInt },
    }
});
const ModContactInputType = new GraphQLInputObjectType({
    name: 'ModContactInputType',
    fields: {
        new: { type: new GraphQLNonNull(GraphQLInt) },
        old: { type: new GraphQLNonNull(ContactInputType) },
    }
});
const SyncDataInputType = new GraphQLInputObjectType({
    name: 'SyncDataInputType',
    fields: {
        contacts: { type: new GraphQLNonNull(new GraphQLList(ContactInputType)) },
        adds: { type: new GraphQLList(GraphQLInt) },
        mods: { type: new GraphQLList(ModContactInputType) },
        dels: { type: new GraphQLList(GraphQLInt) },
    }
});
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        sync: {
            type: new GraphQLList(ContactType),
            args: {
                token: { type: new GraphQLNonNull(GraphQLString) },
                data: { type: new GraphQLNonNull(SyncDataInputType) },
            },
            async resolve(source, { token, data: { contacts: clientContacts, adds: clientAdds, mods: clientMods, dels: clientDels } }) {
                const oid = await network.getOauthId(token);
                const serverContacts = await UserModel.findOne({ oid }, 'contacts') || [];

                // First handle deleted contacts
                const delContacts = (clientDels || []).map(del => clientContacts[del]);
                console.log(delContacts);                
                delContacts.forEach((delContact) => {
                    const index = _.findIndex(serverContacts, serverContact => _.isEqual(serverContact, delContact));
                    if (index != -1) {
                        console.log(`delete: ${util.inspect(delContact)}`);

                        serverContacts.splice(index, index + 1);
                    }
                });

                // Then, modifieds'
                const modContacts = (clientDels || []).map(del => clientContacts[del]);
                console.log(modContacts);                
                (clientMods || []).forEach((newIndex, oldContact) => {
                    const index = _.findIndex(serverContacts.map(serverContact => ({ name: serverContact.name, phones: serverContact.phones }),
                        serverContactWithoutUpdatetime => _.isEqual(serverContactWithoutUpdatetime, oldContact)));
                    if (index != -1) {
                        console.log(`modify: ${util.inspect(oldContact)} => ${util.inspect(clientContacts[newIndex])}`);
                        console.log(`add: ${util.inspect(addContact)}`);

                        serverContacts[index] = clientContacts[newIndex];
                    }
                });

                // Finally Addeds'
                const addContacts = (clientAdds || []).map(add => clientContacts[add]);
                console.log(addContacts);
                addContacts.forEach((addContact) => {
                    const index = _.findIndex(serverContacts, serverContact => _.isEqual(serverContact, addContact));
                    if (index == -1) {
                        console.log(`add: ${util.inspect(addContact)}`);

                        serverContacts.push(addContact);
                    }
                });

                return [];
            }
        }
    },
});

async function getContacts(token) {
    const oid = await network.getOauthId(token);
    return UserModel.findOne({ oid }).exec().then(user => user ? user.contacts : []);
}

// function tidy() {}

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});

module.exports = schema;