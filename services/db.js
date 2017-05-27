const mongoose = require('mongoose');
const userSchema = require('../databases/schemas/userSchema');

const DB_URI = process.env.MONGO_URI;

mongoose.Promise = global.Promise;
const db = mongoose.connect(DB_URI)
const UserModel = mongoose.model('UserModel', userSchema, 'user');

module.exports = {
    db,
    UserModel,
};
