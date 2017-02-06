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
    email: {type: GraphQLString},
    password: {type: GraphQLString},
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
        // TODO: db.close
        return new Promise((resolve, reject) => {
          MongoClient.connect('mongodb://mongo.t1.daoapp.io:61131/contact', (err, db) => {
            if (err) {
              reject(err);
              return;
            }

            db.collection('mes').findOne({_id: ObjectID.createFromHexString(_id)}, (err, me) => {
              if (err) {
                reject(err);
                return;
              }

              console.log(`Query: ${_id}`);
              resolve(me);
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
    login: {
      type: Me,
      args: {
        email: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
        client_id: {type: new GraphQLNonNull(GraphQLString)},
      },
      resolve(source, {email, password, client_id}) {
        return new Promise((resolve, reject) => {
          // TODO: db.close
          MongoClient.connect('mongodb://mongo.t1.daoapp.io:61131/contact', (err, db) => {
            if (err) {
              reject(err);
              return;
            }

            // Merge
            db.collection('mes').findOne({email}, (err, doc) => {
              if (err) {
                reject(err);
                return;
              }

              if (!doc) {
                // Regist
                const newMe = {};
                newMe._id = new ObjectID();
                newMe.client_id = client_id;
                newMe.email = email;
                newMe.password = password;  // TODO: encript
                newMe.contacts = [];
                db.collection('mes').insertOne(newMe, (err, result) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  console.log(`Regist: ${email} - ${client_id}`);
                  resolve(newMe);
                });
              } else {
                // Login
                if (password != doc.password) {   // TODO: encript
                  reject(new Error(`Login fail: Wrong password`));
                } else {
                  console.log(`Login: ${email} - ${client_id}`);
                  resolve(doc);
                }
              }
            });
          });
        });
      }
    },

    set: {
      type: Me,
      args: {
        _id: {type: new GraphQLNonNull(GraphQLString)},
        client_id: {type: new GraphQLNonNull(GraphQLString)},
        contacts: {type: new GraphQLList(ContactInput)},
      },
      resolve(source, {_id, client_id, contacts}) {
        return new Promise((resolve, reject) => {
          // TODO: db.close
          MongoClient.connect('mongodb://mongo.t1.daoapp.io:61131/contact', (err, db) => {
            if (err) {
              reject(err);
              return;
            }

            // Merge
            db.collection('mes').findOne({_id: ObjectID.createFromHexString(_id)}, (err, doc) => {
              if (!doc) {
                reject(new Error(`No such user: ${_id}`));
                return;
              }

              if (doc.client_id != client_id) {
                reject(new Error(`\`client_id\` not equal: current(${client_id}) - old(${doc.client_id})`));
                return;
              }

              // Merge by phone number
              const idMap = new Map();
              for (let contact of doc.contacts) {
                idMap.set(contact._id, contact);
              }
              // Replace update and delete item
              contacts.filter((contactInput) => {
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

              doc.contacts = Array.from(idMap.values());
              // Add new item by phone number
              contacts.filter((contactInput) => {
                return !contactInput._id;
              }).forEach((contactInput, index, contactsInput) => {
                if (!doc.contacts.find((contact, index, contacts) => contact.client_id == contactInput.client_id)) {
                  console.log(`new contact: '${contactInput.name}'`);
                  let newContact = {};
                  newContact._id = new ObjectID();
                  newContact.client_id = contactInput.client_id;
                  newContact.name = contactInput.name;
                  newContact.phone = contactInput.phone;
                  doc.contacts.push(newContact);
                } else {
                  console.log(`pass contact: '${contactInput.name}'`);
                }
              });

              // Db
              db.collection('mes').updateOne({_id: doc._id}, doc, (err, result) => {
                if (err) {
                  reject(err);
                  return;
                }

                resolve(doc);
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
