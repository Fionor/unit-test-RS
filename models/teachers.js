const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const teachers_Schema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true
    },
    created_tests: {
        type: Array,
        default: []
    },
}, {versionKey: false});

mongoose.model('teachers', teachers_Schema);