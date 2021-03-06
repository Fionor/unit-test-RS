const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('users');
const Teacher = mongoose.model('teachers');
const Student = mongoose.model('students');
const Group = mongoose.model('groups');
const request = require('request-promise');
const config = require('../../../config');
const ObjectId = mongoose.mongo.ObjectId;

// GET
module.exports.get = async (req, res) => {
    try {
        if( req.query.user_ids == null || req.query.user_ids == '' ){
            return res.send({status: 400, error: {error_msg: "invalid_request"}});
        }
        const user_ids = req.query.user_ids.split(',');
        for (let i = 0; i < user_ids.length; i++) {
            const element = user_ids[i];
            if(!ObjectId.isValid(element)){
                return res.send({status: 400, error: {error_msg: "invalid_request"}}); 
            }
        }
        const users = await User.find({_id: {'$in': user_ids}}).exec();
        if(!users) return res.send({status: 200, response: []});
        let response = users.reduce((prev, curr) => {
            return [...prev, {user: {id: curr._id, fio: curr.fio, role: curr.role, admin_scope: curr.admin_scope, verified: curr.verified}}];
        }, [])
        return res.send({status: 200, response: response});
    } catch (error) {
        console.error('users.get', error);
        res.send(500, error);
    }
    
}

module.exports.get_offset_users = (offset, count, fio) => {
    return new Promise(async (resolve, reject) => {
        try {
            offset = Number(offset);
            count = Number(count);
            let regex_patern = new RegExp(/.*/);
            if(fio && fio.length >= 3) regex_patern = new RegExp(fio.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim());

            const users_count = await User.find({verified: true, fio: { $regex: regex_patern, $options: 'i'}}).count().exec();
            
            let users = await User.find({verified: true, fio: { $regex: regex_patern, $options: 'i'}}).limit(count).skip(offset).exec();
            users = await Promise.all(users.map(async user => {
                let new_user_object = {fio: user.fio, id: user.id, role: user.role};
                if(user.role == 'student') {
                    const student = await Student.findOne({user_id: user._id}).exec();
                    const group = await Group.findById(student.group_id).exec();
                    new_user_object.group = group.name;
                }
                return new_user_object;
            }))
            resolve({users, users_count});
        } catch (error) {
            console.error('users.get', error);
            reject(error)
        }
    })
}

//GET
module.exports.get_recovery_password_status = async (req, res) => {
    try {
        const user = await User.findOne({username: req.query.username}).exec();
        if(user) {
            return res.send({status: 200, response: [{
                recovery_status: user.change_password
            }]})
        } else {
            return res.send({status: 400, errors: [{error_msg: 'invalid username'}]})
        }
    } catch (error) {
        console.error('users.get_recovery_password_status', error);
        res.send(500, error);
    }
}

//GET
module.exports.get_recovery_users = async (req, res) => {
    try {
        let users = await User.find({change_password: 1}).exec();
        let response = await Promise.all(users.map(async user => {
            let user_data = {
                id: user._id,
                fio: user.fio,
                role: user.role
            }
            if(user.role == 'student'){
                let student = await Student.findOne({user_id: user._id}).exec();
                let group = await Group.findById(student.group_id).exec();
                user_data.group = group;
            }
            return user_data
        }));
        return res.send({status: 200, response}) 
    } catch (error) {
        console.error('users.get_recovery_users', error);
        res.send(500, error);
    }
}
//POST
module.exports.recovery_password = async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username}).exec();
        if(user){
            if(req.body.code == 2){
                if(user.change_password == 2){
                    if(!req.body.password || req.body.password.length < 6 || !req.body.password.match(/^\w+$/)){
                        return res.send({status: 400, errors: [{error_msg: 'invalid passwrod (length > 5, match(\\w))'}]})
                    }
                    user.password = req.body.password;
                    user.change_password = 0;
                    await user.save();
                    return res.send({status: 200, response: []})
                } else {
                    return res.send({status: 400, errors: [{error_msg: 'invalid user change password status'}]})
                }
            } else if(req.body.code == 1) {
                if(user.change_password == 0){
                    user.change_password = 1;
                    await user.save();
                    //log out
                    await request({
                        method: 'GET',
                        url: `http://${config.oauth.url}${config.oauth.port ? `:${config.oauth.port}` : ''}/logout`,
                        qs: {
                            access_token: req.body.access_token,
                            all: 1
                        },
                        json: true
                    });
                    return res.send({status: 200, response: []})
                } else {
                    return res.send({status: 400, errors: [{error_msg: 'invalid user change password status'}]})
                }
            } else {
                return res.send({status: 400, errors: [{error_msg: 'invalid code value (1 or 2)'}]})
            }
        } else {
            return res.send({status: 400, errors: [{error_msg: 'invalid username'}]})
        }
    } catch (error) {
        console.error('users.recovery_password', error);
        res.send(500, error);
    }
}

//POST
module.exports.change_password = async (req, res) => {
    try {
        let user = await User.findById(res.token.user.id).exec();
        if(bcrypt.compareSync(req.body.password, user.password)){
            if(req.body.new_password.length < 6 || !req.body.new_password.match(/^\w+$/)){
                return res.send({status: 400, errors: [{error_msg: 'invalid new password (length > 5, match(\\w))'}]})
            }
            user.password = req.body.new_password;
            await user.save();
            //log out
            await request({
                method: 'GET',
                url: `http://${config.oauth.url}${config.oauth.port ? `:${config.oauth.port}` : ''}/logout`,
                qs: {
                    access_token: req.body.access_token,
                    all: 1
                },
                json: true
            });
            return res.send({status: 200, response: []});
        } else {
            return res.send({status: 400, errors: [{error_msg: 'invalid old password'}]});
        }
    } catch (error) {
        console.error('users.change_password', error);
        res.send(500, error);
    }
}

// POST
module.exports.create = async (req, res) => {
    try {
        const check_token = await request({
            method: 'GET',
            url: `http://${config.oauth.url}${config.oauth.port ? `:${config.oauth.port}` : ''}/onetime_token`,
            qs: {
                onetime_token: req.body.onetime_token
            },
            json: true
        });
        if( check_token['response'][0].onetime_token == true ){
            const user = await User.findOne({username: req.body.username}).exec();
            if( user ) {
                return res.send({status: 400, error: {error_msg: 'invalid_username'}});
            }
            if(
                !req.body.fio.match(/^[А-яіїєыЫІЇЄ]+\s[А-яіїєыЫІЇЄ]+\s[А-яіїєыЫІЇЄ]+$/) ||
                req.body.username.length < 4 ||
                !req.body.username.match(/^\w+$/) ||
                req.body.role == '' ||
                (req.body.role == 'student' && !ObjectId.isValid(req.body.group_id)) ||
                req.body.password.length < 6 ||
                !req.body.password.match(/^\w+$/)
            ) {
                return res.send({status: 400, errors: [
                    {error_msg: 'invalid user data'}
                ]})
            }

            let new_user = await User.create({fio: req.body.fio, username: req.body.username, password: req.body.password,
                role: req.body.role});
            let new_role;
            if( req.body.role == 'student' ) {
                new_role = await Student.create({user_id: new_user._id, group_id: req.body.group_id});
            } else {
                new_role = await Teacher.create({user_id: new_user._id});
            }

            return res.send({status: 200, user_id: new_user._id});
        } else {
            return res.send({status: 401, error: {error_msg: 'invalid_onetime_token'}});
        }
    } catch (error) {
        console.error('users.create', error);
        res.send({status: 500, error: {error_msg: error}});
    }
}

// GET
module.exports.password_check = async (req, res) => {
    try {
        const check_token = await request({
            method: 'GET',
            url: `http://${config.oauth.url}${config.oauth.port ? `:${config.oauth.port}` : ''}/onetime_token`,
            qs: {
                onetime_token: req.query.onetime_token
            },
            json: true
        });
        if( check_token.status == 200 && check_token['response'][0].onetime_token == true ){
            const user = await User.findOne({username: req.query.username}).exec();
            if( user != void(0) && bcrypt.compareSync(req.query.password, user.password) ){
                return res.send({status: 200, user_id: user._id});
            } else {
                return res.send({status: 400});
            }
        } else {
            return res.send({status: 400, error: {error_msg: 'invalid_onetime_token'}});
        }
    } catch (error) {
        console.error('users.password_check', error)
        res.send({status: 500, error: {error_msg: error}});
    }
}

module.exports.set_permissions = async (req, res) => {
    try {
        let admin = await User.findById(res.token.user.id).exec();
        const errors = req.body.permissions.map(permission => {
            if(Object.keys(config.admin_permissions).indexOf(permission) == -1) return {permission, error_msg: 'invalid type'};
        });

        if(errors[0] != null) {
            return res.send({status: 400, errors});
        }

        const user = await User.findById(req.body.user_id).exec();
        req.body.permissions.forEach(permission => {
            user.admin_scope = user.admin_scope ^ config.admin_permissions[permission];
        })
        await user.save();

        return res.send({status: 200, response: [{user_id: req.body.user_id}]});
    } catch (error) {
        console.error('users.set_permissions', error)
        res.send({status: 500, error: {error_msg: error}});
    }
}

module.exports.get_unverified_users = async (req, res) => {
    try {
        let users = await User.find({verified: false}).exec();
        let response = await Promise.all(users.map(async user => {
            let user_data = {
                id: user._id,
                fio: user.fio,
                role: user.role
            }
            if(user.role == 'student'){
                let student = await Student.findOne({user_id: user._id}).exec();
                let group = await Group.findById(student.group_id).exec();
                user_data.group = group;
            }
            return user_data
        }));
        return res.send({status: 200, response}) 
    } catch (error) {
        console.error('users.get_unverified_users', error)
        res.send({status: 500, error: {error_msg: error}});
    }
}

//POST
module.exports.verification = async (req, res) => {
    try {
        const user = await User.findById(req.body.id).exec();
        if(user && !user.verified){
            if(req.body.command == 'set') {
                user.verified = true;
                await user.save();
            } else if(req.body.command == 'delete') {
                if(user.role == 'teacher'){
                    await Teacher.deleteOne({user_id: user._id}).exec();
                } else {
                    await Student.deleteOne({user_id: user._id}).exec();
                }
                await user.remove();
            }
            return res.send({status: 200, response: [{user_id: user._id}]});
        } else {
            return res.send({status: 400, errors: [{error_msg: 'invalid user'}]})
        }

    } catch (error) {
        console.error('users.verification', error)
        res.send({status: 500, error: {error_msg: error}});
    }
}

//POST
module.exports.recovery = async (req, res) => {
    try {
        const user = await User.findById(req.body.id).exec();
        if(user && user.change_password == 1){
            if(req.body.command == 'set') {
                user.change_password = 2;
            } else if(req.body.command == 'delete') {
                user.change_password = 0
            }
            await user.save();
            return res.send({status: 200, response: [{user_id: user._id}]});
        } else {
            return res.send({status: 400, errors: [{error_msg: 'invalid user'}]})
        }
    } catch (error) {
        console.error('users.recovery', error)
        res.send({status: 500, error: {error_msg: error}});
    }
}