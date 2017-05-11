const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    oid: String,

    contacts: [{
        name: String,
        phones: [String],
        last_update: Date,
    }],
});

module.exports = userSchema;