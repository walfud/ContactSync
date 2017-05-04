const mongoose = require('mongoose');
const userSchema = require('./schemas/userSchema');
const contactSchema = require('./schemas/contactSchema');

const DB_URI = 'mongodb://localhost/data_center';

const db = mongoose.connect(DB_URI)
const User = mongoose.model( 'User', userSchema, 'contactsync' );

module.exports = {
    db,
    User,
};