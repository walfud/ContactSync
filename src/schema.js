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
    client_id: {type: GraphQLID},
    name: {type: GraphQLString},
    phone: {type: GraphQLString},
  }
});
const Me = new GraphQLObjectType({
  name: 'Me',
  fields: {
    _id: {type: GraphQLID},
    client_id: {type: GraphQLID},
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

              console.log(`Query: ${me._id}`);
              resolve(docs[0]);
            });
          });
        });
      }
    }
  }
});


const ContactInput = new GraphQLInputObjectType({
  name: 'ContactInput',
  fields: {
    client_id: {type: new GraphQLNonNull(GraphQLString)},
    name: {type: GraphQLString},
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
        client_id: {type: new GraphQLNonNull(GraphQLString)},
        contacts: {type: new GraphQLList(ContactInput)},
      },
      resolve(source, me) {
        return new Promise((resolve, reject) => {
          // TODO: db.close
          MongoClient.connect('mongodb://mongo.t1.daoapp.io:61131/contact', (err, db) => {
            if (err) {
              reject(err);
              return;
            }

            // Merge
            db.collection('mes').findOne({_id: me._id}, (err, doc) => {
              let newMe = {};
              newMe._id = me._id;
              newMe.client_id = me.client_id;
              newMe.contacts = [];

              if (doc) {
                // Merge by phone number
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
                    console.log(`delete contact: '${contactInput.name}'`);

                    idMap.delete(contactInput._id);
                  } else {
                    // Update
                    console.log(`update contact: '${contactInput.name}'`);

                    const updateContact = idMap.get(contactInput._id);
                    updateContact.client_id = contactInput.client_id;
                    updateContact.name = contactInput.name;
                    updateContact.phone = contactInput.phone;
                  }
                });

                newMe.contacts.push(...Array.from(idMap.values()));
              }
              // Add new item by phone number
              me.contacts.filter((contactInput) => {
                return !contactInput._id;
              }).forEach((contactInput, index, contactsInput) => {
                if (!newMe.contacts.find((contact, index, contacts) => contact.client_id == contactInput.client_id)) {
                  console.log(`new contact: '${contactInput.name}'`);
                  let newContact = {};
                  newContact._id = new ObjectID();
                  newContact.client_id = contactInput.client_id;
                  newContact.name = contactInput.name;
                  newContact.phone = contactInput.phone;
                  newMe.contacts.push(newContact);
                } else {
                  console.log(`pass contact: '${contactInput.name}'`);
                }
              });

              // Db
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
