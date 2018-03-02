const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const tests_Schema = new mongoose.Schema({
    teacher: {
        type: ObjectId,
        required: true
    },
    forGroups: [],
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    subscribers: [ObjectId],
    questionsCount: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: false,
        default: 'not_defined'
    },
    variants:[]
}, { versionKey: false });

mongoose.model('tests', tests_Schema);

/*---------------------
state
not_defined - тестування не розпочате
in_progress - відбувається тестування
complited - тестування завершено 
---------------------*/