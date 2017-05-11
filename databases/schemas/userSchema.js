const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    _id: false,

    id: String,
    name: String,
    phones: [String],
    modify_time: Number,
    is_deleted: Boolean,
});

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    oid: String,

    contacts: [contactSchema],
});

module.exports = userSchema;