const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    oid: String,

    contacts: [{
        name: String,
        phones: [String],
        last_update: Number,
    }],
});

module.exports = userSchema;