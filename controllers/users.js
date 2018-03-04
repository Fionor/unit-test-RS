const mongoose = require('mongoose');
const User = mongoose.model('users');
const Teacher = mongoose.model('teachers');
const Student = mongoose.model('students');
const request = require('request-promise');
const config = require('../config');

// GET
module.exports.get = async (req, res) => {
    try {
        switch (req.query.v) {
            case '1':
                if( ( req.query.onetime_token == null || req.query.onetime_token == '' ) || ( req.query.user_ids == null || req.query.user_ids == '' ) ){
                    return res.send({status: 400, error: {error_msg: "invalid_request"}});
                }
                const check_token = await request({
                    method: 'GET',
                    url: `http://${config.oauth.url}${config.oauth.port ? `:${config.oauth.port}` : ''}/onetime_token`,
                    qs: {
                        onetime_token: req.query.onetime_token
                    },
                    json: true
                });
                if( check_token['response'][0].onetime_token == true ){
                    const user_ids = req.query.user_ids.split(',');
                    return res.send({status: 200, response: [user_ids]});
                } else {
                    return res.send({status: 400, error: {error_msg: 'invalid_onetime_token'}});
                }
            break;
        
            default:
                return res.send({status: 400, error: {error_msg: "invalid_request"}});
            break;
        }
    } catch (error) {
        console.log('users.get', error);
        res.send(500, error);
    }
    
}

module.exports.create = async (req, res) => {
    try {
        switch (String(req.body.v)) {
            case '1':
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
                    let new_user = await User.create({FIO: req.body.fio, username: req.body.username, password: req.body.password,
                        role: req.body.role});
                    let new_role;
                    if( req.body.role == 'student' ) {
                        new_role = await Student.create({user_id: new_user._id, group: req.body.group});
                    } else {
                        new_role = await Teacher.create({user_id: new_user._id});
                    }
                    new_user.role_id = new_role._id;
                    await new_user.save();

                    return res.send({status: 200, user_id: new_user._id});
                } else {
                    return res.send({status: 400, error: {error_msg: 'invalid_onetime_token'}});
                }
            break;
        
            default:
                return res.send({status: 400, error: "invalid_request"});
            break;
        }
    } catch (error) {
        console.log('users.create', error);
        res.send(500, error);
    }
}