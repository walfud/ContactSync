const mongoose = require('mongoose');
const userSchema = require('../databases/schemas/userSchema');
const contactSchema = require('../databases/schemas/userSchema');

const DB_URI = 'mongodb://localhost/data_center';

mongoose.Promise = global.Promise;
const db = mongoose.connect(DB_URI)
const UserModel = mongoose.model( 'UserModel', userSchema, 'contactsync' );

module.exports = {
    db,
    UserModel,
};