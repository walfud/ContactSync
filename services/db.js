const mongoose = require('mongoose');
const userSchema = require('../databases/schemas/userSchema');

const DB_URI = 'mongodb://localhost/contactsync';

mongoose.Promise = global.Promise;
const db = mongoose.connect(DB_URI)
const UserModel = mongoose.model('UserModel', userSchema, 'user');

module.exports = {
    db,
    UserModel,
};