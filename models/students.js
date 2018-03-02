const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const students_Schema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    testsSubscribes: [{
        _id: false,
        test_id: ObjectId,
        variant: Number,
        questions: [Number],
        test_complited: Boolean
    }]
}, {versionKey: false});

mongoose.model('students', students_Schema);