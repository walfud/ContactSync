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

const UserModel = require('../services/db').UserModel;
const network = require('../services/network');

const ContactType = new GraphQLObjectType({
    name: 'ContactType',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        phone: { type: GraphQLString },
    }
});
const UserType = new GraphQLObjectType({
    name: 'UserType',
    fields: {
        username: { type: GraphQLString },
        contacts: { type: new GraphQLList(ContactType) },
    }
});
const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        me: {
            type: UserType,
            args: {
                token: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(source, { token }) {
                const oid = await network.getOauthId(token);
                const { username, contacts } = await UserModel.findOne({ oid }).exec();

                return {
                    username,
                    contacts,
                }
            }
        }
    },
});

// const SyncType = new GraphQLObjectType({
// });
// const Mutation = new GraphQLObjectType({
//     name: 'Mutation',
//     fields: {
//         sync: {
//             type: SyncType,
//             args: {
//                 token: { type: new GraphQLNonNull(GraphQLString) },
//             },
//             async resolve(source, { token }) {
//                 const oid = await network.getOauthId(token);
//                 const { username, contacts } = await UserModel.findOne({ oid }).exec();

//                 return {
//                     username,
//                     contacts,
//                 }
//             }
//         }
//     },
// });

const schema = new GraphQLSchema({
    query: Query,
    // mutation: Mutation,
});

module.exports = schema;