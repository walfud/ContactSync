const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLID = require('graphql').GraphQLID;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLSchema = require('graphql').GraphQLSchema;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;

const Contact = new GraphQLObjectType({
    name: 'Contact',
    fields: {
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        phone: {type: GraphQLString},
    }
});
const User = new GraphQLObjectType({
  name: 'User',
  fields: {
    oid: {type: GraphQLID},
    token: {type: GraphQLString},
    refresh_token: {type: GraphQLString},

    contacts: {type: new GraphQLList(Contact)},
  }
});
const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: User,
      args: {
        token: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve(source, {token}) {
        return[];
      }
    }
  }
});

const schema = new GraphQLSchema({
  query: Query,
//  mutation: Mutation,
});

module.exports = schema;