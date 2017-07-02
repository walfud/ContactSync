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
                const oid = await network.fetchOid(token);
                return UserModel.findOne({ oid }).exec().then(user => user ? user.contacts : []);
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
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        upload: {
            type: GraphQLBoolean,
            args: {
                token: { type: new GraphQLNonNull(GraphQLString) },
                contacts: { type: new GraphQLNonNull(new GraphQLList(ContactInputType)) },
            },
            async resolve(source, { token, contacts }) {
                const oid = await network.fetchOid(token);
                await UserModel.update({ oid }, { $set: { contacts } }, { upsert: true });
                return true;
            }
        },
    }
});

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});

module.exports = schema;