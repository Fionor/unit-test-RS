const mongoose = require('mongoose');
const ObjectId = mongoose.mongo.ObjectId;
const request = require('request-promise');
const config = require('../config');

module.exports = async (params, req, res, callback = (req, res) => {}) => {
    try {
        let errors = [];
        if(params.for_auth){
            if ( req[params.req_type == 'GET' ? 'query' : 'body'].access_token ){
                const check_token = await request({
                    method: 'GET',
                    url: `http://${config.oauth.url}${config.oauth.port ? `:${config.oauth.port}` : ''}/token-info`,
                    qs: {
                        access_token: req[params.req_type == 'GET' ? 'query' : 'body'].access_token
                    },
                    json: true
                });
                if( check_token.status != 200 ){
                    return res.send(check_token);
                }
                if( !check_token.response[0].user.verified ){
                    return res.send({status: 401, error: {error_msg: 'user is not verified'}})
                }
                res.token = {user: check_token.response[0].user}
            } else {
                return res.send({status: 401, error: {error_msg: 'invalid_token'}});
            }
        }
        for1: for (let i = 0; i < params.variables.length; i++) {
            const element = params.variables[i];
            switch (params.req_type) {
                case "GET":
                    if(  req.query[element.parametr] == null ||  req.query[element.parametr] == '' ){
                        errors.push({error: {error_msg: `${element.parametr} not found`}});
                        continue for1;
                    }
                    if ( element.type ==  'array'){
                        const array_items = req.query[element.parametr].split(',');
                        for2: for (let j = 0; j < array_items.length; j++) {
                            const element2 = array_items[j];
                            switch (element.array_item) {
                                case 'objectid':
                                    if(!ObjectId.isValid(element2)){
                                        errors.push({error: {error_msg: `${element2} is not objectid `}});
                                        continue for1;
                                    }
                                    break;
                            }
                        }
                    } else if( element.type == 'objectid' ){
                        if(!ObjectId.isValid(req.query[element.parametr])){
                            errors.push({error: {error_msg: `${element.parametr} is not objectid `}});
                            continue for1;
                        }
                    }
                    break;
                case "POST":
                    if(element.type == 'file'){
                        console.log('req.files',req.files[element.parametr])
                        if(req.files == undefined || req.files[element.parametr] == null ) {
                            errors.push({error: {error_msg: `${element.parametr} is not file `}});
                            continue for1;
                        }
                    } else {
                        if( req.body[element.parametr] == null ){
                            errors.push({error: {error_msg: `${element.parametr} not found`}});
                            continue for1;
                        }
                        if( element.type == 'string' ){
                            if( typeof req.body[element.parametr] != 'string' ){
                                errors.push({error: {error_msg: `${element.parametr} is not string`}});
                                continue for1;
                            }
                            if ( req.body[element.parametr] == '' ) {
                                errors.push({error: {error_msg: `${element.parametr} is empty`}});
                                continue for1;
                            }
                        } else if (element.type == 'number') {
                            if( typeof req.body[element.parametr] != 'number' ){
                                errors.push({error: {error_msg: `${element.parametr} is not number`}});
                            }
                        } else if (element.type == 'array') {
                            if ( !Array.isArray(req.body[element.parametr]) ){
                                errors.push({error: {error_msg: `${element.parametr} is not array`}});
                                continue for1;
                            }
                            if( req.body[element.parametr].length == 0 ){
                                errors.push({error: {error_msg: `${element.parametr} is empty`}});
                                continue for1;
                            }
                            req.body[element.parametr].forEach(array_item => {
                                switch (element.array_item) {
                                    case 'string':
                                        if( typeof array_item !== 'string' ){
                                            errors.push({error: {error_msg: `${element.parametr} has not string item`}});
                                        }
                                        else if ( array_item == '' ) {
                                            errors.push({error: {error_msg: `${element.parametr} has empty item`}});
                                        }
                                        break;
                                    case 'object':
                                        if (Object.prototype.toString.call(array_item) !== "[object Object]"){
                                            errors.push({error: {error_msg: `${element.parametr} has not object item`}});
                                        }
                                        break;
                                    default:
                                        break;
                                }     
                            });
                            
                        } else if( element.type == 'objectid' ){
                            if(!ObjectId.isValid(req.body[element.parametr])){
                                errors.push({error: {error_msg: `${element.parametr} is not objectid `}});
                                continue for1;
                            }
                        }
                    }
                    break;
            }
        }
        if(errors.length > 0){
            return res.send({status: 400, errors});
        } else {
            callback(req, res);
        }
    } catch (error) {
        console.error('validator ERROR', JSON.stringify(error));
    }
    
}