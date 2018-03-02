const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const students_Schema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true
    },
    created_tests: [{
        _id: false,
        id: ObjectId
    }],
});

mongoose.model('students', students_Schema);