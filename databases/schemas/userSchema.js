const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    oid: String,

    contacts: [{
        id: String,
        name: String,
        phones: [String],
    }],
});

module.exports = userSchema;