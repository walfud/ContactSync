const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    oid: String,

    contacts: [
        {
            name: String,
            phones: [String],
            last_update: Number,
            is_deleted: Boolean,
        }
    ],
});

module.exports = userSchema;