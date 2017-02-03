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
      resolve(source, args) {
        // TODO: db.close
        return new Promise((resolve, reject) => {
          MongoClient.connect('mongodb://mongo.t1.daoapp.io:61131/contact', (err, db) => {
            if (err) {
              reject(err);
              return;
            }

            db.collection('mes').find(args).toArray((err, docs) => {
              if (err) {
                reject(err);
                return;
              }

              resolve(docs[0]);
            });
          });
        });

        // return {
        //   _id: '568abef565368511002b9698',
        //   contacts: [
        //     {
        //       _id: '1111111111111111111111',
        //       phone: '13911592475',
        //     },
        //     {
        //       _id: '2222222222222222222222222',
        //       phone: '18618817397',
        //     },
        //   ],
        // }
      }
    }
  }
});


const Schema = new GraphQLSchema({
  query: Query,
});

export default Schema;
