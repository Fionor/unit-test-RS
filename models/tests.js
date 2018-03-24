const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const tests_Schema = new mongoose.Schema({
    for_groups: {
        type: Array,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    subscribers: [ObjectId],
    state: {
        type: String,
        default: 'not_defined'
    },
    variants: {
        type: Array,
        required: true
    }
}, { versionKey: false });

mongoose.model('tests', tests_Schema);

/*---------------------
state
not_defined - тестування не розпочате
in_progress - відбувається тестування
complited - тестування завершено 
---------------------*/