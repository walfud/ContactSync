import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';


const Query = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    // TODO: ...
  }
});
let Mutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: {
    // TODO: ...
  }
})

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default Schema;
