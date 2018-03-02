const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ObjectId = mongoose.Schema.ObjectId;

const users_Schema = new mongoose.Schema({
    FIO: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    role_id: {
        type: ObjectId,
        required: true
    },
    admin_scope: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    change_password: {
        type: Number,
        default: 0
    }
}, { versionKey: false });

teacherSchema.pre('save', function(next) {
    if(this.isModified('password') || this.isNew()) this.password = bcrypt.hashSync(this.password, 12);
    next();
});

teacherSchema.pre('findOneAndUpdate', function(next) {
    if(this._update.$set && this._update.$set.password) this.findOneAndUpdate({}, {password: bcrypt.hashSync(this._update.$set.password, 12)}); 
    next();
});

mongoose.model('users', users_Schema);

/*---------------------
change_password
0 - не потребує зміни паролю
1 - запит на зміну паролю
2 - запит підтвердженно, зміна дозволенна
---------------------*/