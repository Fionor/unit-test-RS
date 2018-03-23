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
                            errors.push({error: {error_msg: `${req.query[element.parametr]} is not objectid `}});
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
        console.log('validator ERROR', error)
    }
    
}