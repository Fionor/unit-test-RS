const mongoose = require('mongoose');

const groups_Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { versionKey: false });

mongoose.model('groups', groups_Schema);