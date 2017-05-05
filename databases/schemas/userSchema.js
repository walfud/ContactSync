const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    oid: String,
    username: String,

    contacts: [{
        id: String,
        name: String,
        phone: String,
    }],
});

module.exports = userSchema;