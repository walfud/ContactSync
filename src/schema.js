import {
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import {MongoClient} from 'mongodb';


const Contact = new GraphQLObjectType({
  name: 'Contact',
  fields: {
    _id: {type: GraphQLID},
    phone: {type: GraphQLString},
  }
});
const Me = new GraphQLObjectType({
  name: 'Me',
  fields: {
    _id: {type: GraphQLID},
    contacts: {type: new GraphQLList(Contact)},
  }
});


const Query = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    me: {
      type: Me,
      args: {
        _id: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve(source, {_id}) {
        MongoClient.connect('mongodb://localhost:32768/contact', (err, db) => {
          console.log(123);
          if (err) {
            console.log(err);
            return;
          }

          // TODO: find
        });




        // TODO: mongo
        return {
          _id: '568abef565368511002b9698',
          contacts: [
            {
              _id: '1111111111111111111111',
              phone: '13911592475',
            },
            {
              _id: '2222222222222222222222222',
              phone: '18618817397',
            },
          ],
        }
      }
    }
  }
});


const Schema = new GraphQLSchema({
  query: Query,
});

export default Schema;
