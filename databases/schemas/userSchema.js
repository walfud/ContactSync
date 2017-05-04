const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    oid: String,
    token: String,
    refresh_token: String,

    contacts: [{
        id: String,
        name: String,
        phone_num: String,
    }],
});

module.exports = userSchema;