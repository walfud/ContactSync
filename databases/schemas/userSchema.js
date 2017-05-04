const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    oid: String,
    token: String,
    refresh_token: String,
    username: String,

    contacts: [{
        id: String,
        name: String,
        phone: String,
    }],
});

module.exports = userSchema;