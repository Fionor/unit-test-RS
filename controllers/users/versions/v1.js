const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('users');
const Teacher = mongoose.model('teachers');
const Student = mongoose.model('students');
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
        console.log('users.get', error);
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
            let new_user = await User.create({fio: req.body.fio, username: req.body.username, password: req.body.password,
                role: req.body.role});
            let new_role;
            if( req.body.role == 'student' ) {
                new_role = await Student.create({user_id: new_user._id, group: req.body.group});
            } else {
                new_role = await Teacher.create({user_id: new_user._id});
            }

            return res.send({status: 200, user_id: new_user._id});
        } else {
            return res.send({status: 400, error: {error_msg: 'invalid_onetime_token'}});
        }
    } catch (error) {
        console.log('users.create', error);
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
        console.log('password_check', error)
        res.send({status: 500, error: {error_msg: error}});
    }
}