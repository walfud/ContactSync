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
        phone: { type: GraphQLString },
    }
});
const UserType = new GraphQLObjectType({
    name: 'UserType',
    fields: {
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
                const { contacts } = await getMe(token);

                return {
                    contacts,
                }
            }
        }
    },
});

const ContactInputType = new GraphQLInputObjectType({
    name: 'ContactInputType',
    fields: {
        name: { type: GraphQLString },
        phone: { type: GraphQLString },
    }
});
const TestType = new GraphQLObjectType({
    name: 'TestType',
    fields: {
        add: { type: new GraphQLList(ContactType) },
        del: { type: new GraphQLList(ContactType) },
    }
})
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        test: {
            type: TestType,
            args: {
                token: { type: new GraphQLNonNull(GraphQLString) },
                contacts: { type: new GraphQLNonNull(new GraphQLList(ContactInputType)) }
            },
            async resolve(source, { token, contacts }) {
                const { contacts: oldContacts } = await getMe(token);
                let add = [], unmodify = [], del = [];
                for (let contact of contacts) {
                    let index = oldContacts.findIndex(oldContact => contact.name == oldContact && contact.phone == oldContact.phone);

                    if (index == -1) {
                        add.push(contact);
                    } else {
                        unmodify.push(contact);
                        oldContacts.splice(index, 1);
                    }
                }
                del = oldContacts;

                return {
                    add, del
                };
            }
        },
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
                return contacts;
            }
        }
    },
});

async function getMe(token) {
    const oid = await network.getOauthId(token);
    return await UserModel.findOne({ oid }).exec();
}
function isSameContact(a, b) {
    return a.name == b.name && a.phone == b.phone;
}

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});

module.exports = schema;