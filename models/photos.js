const mongoose = require('mongoose');
const objectId = mongoose.Schema.objectId;

const photos_Schema = new mongoose.Schema({
    created_at: {
        type: Date,
        default: Date.now
    },
    src: {
        type: String,
        required: true,
        unique: true
    },
    is_used: {
        type: Boolean,
        default: false
    },
    md5_hash: {
        type: String,
        required: true,
        unique: true
    }
}, {versionKey: false});

mongoose.model('photos', photos_Schema);