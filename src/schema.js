import {
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import {MongoClient, ObjectID} from 'mongodb';
import util from 'util';


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
      resolve(source, me) {
        // TODO: db.close
        return new Promise((resolve, reject) => {
          MongoClient.connect('mongodb://mongo.t1.daoapp.io:61131/contact', (err, db) => {
            if (err) {
              reject(err);
              return;
            }

            db.collection('mes').find(me).toArray((err, docs) => {
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


const ContactInput = new GraphQLInputObjectType({
  name: 'ContactInput',
  fields: {
    name: {type: new GraphQLNonNull(GraphQLString)},
    phone: {type: GraphQLString},
    delete: {type: GraphQLBoolean},
  }
});
const Mutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: {
    set: {
      type: Me,
      args: {
        _id: {type: new GraphQLNonNull(GraphQLString)},
        contacts: {type: new GraphQLList(ContactInput)},
      },
      resolve(source, me) {
        return new Promise((resolve, reject) => {
          MongoClient.connect('mongodb://mongo.t1.daoapp.io:61131/contact', (err, db) => {
            if (err) {
              reject(err);
              return;
            }

            // Merge
            db.collection('mes').findOne({_id: me._id}, (err, doc) => {
              let newMe = {};
              newMe._id = me._id;
              newMe.contacts = [];

              if (!doc) {
                // New
                console.log(me);
                console.log(me.contacts);
                console.log(`New contacts: '${util.inspect(me.contacts)}'`);

                newMe.contacts = me.contacts;
              } else {
                // Merge by phone number
                console.log(`Merge contacts: '${util.inspect(me.contacts)}'`);

                const idMap = new Map();
                for (let contact of doc.contacts) {
                  idMap.set(contact._id, contact);
                }
                // Replace update and delete item
                me.contacts.filter((contactInput) => {
                  return contactInput._id;
                }).forEach((contactInput, index, contactsInput) => {
                  if (contactInput.delete) {
                    // Delete
                    console.log(`delete: '${contactInput.name}'`);

                    idMap.delete(contactInput._id);
                  } else {
                    // Update
                    console.log(`update: '${contactInput.name}'`);

                    let updateContact = {};
                    updateContact._id = contactInput._id;
                    updateContact.name = contactInput.name;
                    updateContact.phone = contactInput.phone;
                    idMap.set(contactInput._id, updateContact);
                  }
                });
                // Merge new item by phone number
                const phoneMap = new Map();
                idMap.forEach((contact, _id, idMap) => {
                  phoneMap.set(contact.phone, contact);
                });
                me.contacts.filter((contactInput) => {
                  return !contactInput._id;
                }).forEach((contactInput, index, contactsInput) => {
                  console.log(`new: '${contactInput.name}'`);

                  let newContact = {};
                  newContact._id = contactInput._id;
                  newContact.name = contactInput.name;
                  newContact.phone = contactInput.phone;
                  phoneMap.set(contactInput.phone, newContact);
                });

                newMe.contacts = Array.from(phoneMap.values());
              }

              // Fill mongo's _id
              newMe.contacts.forEach((contact, index, contacts) => {
                if (!contact._id || !ObjectID.isValid(contact._id)) {
                  contact._id = new ObjectID();

                  console.log(`new _id for: '${contact._id}' - '${contact.name}'`);
                }
              });

              //
              db.collection('mes').updateOne({_id: newMe._id}, newMe, {upsert: true}, (err, result) => {
                if (err) {
                  reject(err);
                  return;
                }

                resolve(newMe);
              });
            });
          });
        });
      }
    }
  }
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default Schema;
