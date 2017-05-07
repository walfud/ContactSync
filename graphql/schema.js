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

const UserModel = require('../services/db').UserModel;
const network = require('../services/network');

const ContactType = new GraphQLObjectType({
    name: 'ContactType',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        phones: { type: new GraphQLList(GraphQLString) },
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
        name: { type: GraphQLString },
        phones: { type: new GraphQLList(GraphQLString) },
    }
});
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        sync: {
            type: new GraphQLList(ContactType),
            args: {
                token: { type: new GraphQLNonNull(GraphQLString) },
                contacts: { type: new GraphQLNonNull(new GraphQLList(ContactInputType)) }
            },
            async resolve(source, { token, contacts }) {
                const oid = await network.getOauthId(token);
                const contactsWithId = contacts.map(contact => {
                    contact.id = uuidV4();
                    return contact;
                })
                await UserModel.update({ oid }, { oid, contacts: contactsWithId, }, { upsert: true }).exec();

                return contacts || [];
            }
        }
    },
});

async function getContacts(token) {
    const oid = await network.getOauthId(token);
    return UserModel.findOne({ oid }).exec().then(user => user ? user.contacts : []);
}

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});

module.exports = schema;