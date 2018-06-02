const version1 = require('./versions/v1');
const validator = require('../../validator/');
const config = require('../../config')
// GET
module.exports.get = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET',
                variables: [
                    {
                        parametr: 'user_ids',
                        type: 'array',
                        array_item: 'objectid'
                    }
                ]
            }, req, res, version1.get);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

// GET
module.exports.get_offset_users = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET', for_auth: true, permissions: [config.admin_permissions.ACCESS_ADMIN],
                variables: [
                    {
                        parametr: 'offset',
                        type: 'string'
                    },
                    {
                        parametr: 'offset',
                        type: 'string'
                    }
                ]
            }, req, res, null).then(data => {
                
                let errors = []
                if(req.query.count < 1) errors.push({error_msg: 'invalid count (>= 1)'});
                if(req.query.offset < 0) errors.push({error_msg: 'invalid offset (>= 0)'});
                if(errors.length > 0) return res.send({status: 400, errors});

                version1.get_offset_users(req.query.offset, req.query.count).then(result => {
                    res.send({status: 200, response: result.users, meta: {users_count: result.users_count}})
                })
            });
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//GET
module.exports.get_recovery_password_status = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET',
                variables: [
                    {
                        parametr: 'username',
                        type: 'string'
                    }
                ]
            }, req, res, version1.get_recovery_password_status);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//GET
module.exports.get_recovery_users = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET', for_auth: true, permissions: [config.admin_permissions.ACCESS_VERIFICATION_PASSWORD],
                variables: [
                    
                ]
            }, req, res, version1.get_recovery_users);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//POST
module.exports.recovery_password = (req, res) => {
    switch (String(req.body.v)) {
        case '1':
            validator({req_type: 'POST',
                variables: [
                    {
                        parametr: 'username',
                        type: 'string'
                    },
                    {
                        parametr: 'code',
                        type: 'number'
                    }
                ]
            }, req, res, version1.recovery_password);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

// POST
module.exports.create = (req, res) => {
    switch (String(req.body.v)) {
        case '1':
            version1.create(req, res);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

// GET
module.exports.password_check = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            version1.password_check(req, res);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//POST
module.exports.set_permissions = (req, res) => {
    switch (String(req.body.v)) {
        case '1':
            validator({req_type: 'POST', for_auth: true, permissions: [config.admin_permissions.ACCESS_ADMIN],
                variables: [
                    {
                        parametr: 'permissions',
                        type: 'array',
                        array_item: 'string'
                    },
                    {
                        parametr: 'user_id',
                        type: 'objectid'
                    }
                ]
            }, req, res, version1.set_permissions);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//GET
module.exports.get_unverified_users = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET', for_auth: true, permissions: [config.admin_permissions.ACCESS_VERIFICATION_ACCOUNT],
                variables: [
                    
                ]
            }, req, res, version1.get_unverified_users);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//POST
module.exports.verification = (req, res) => {
    switch (String(req.body.v)) {
        case '1':
            validator({req_type: 'POST', for_auth: true, permissions: [config.admin_permissions.ACCESS_VERIFICATION_ACCOUNT],
                variables: [
                    {
                        parametr: 'command',
                        type: 'string'
                    },
                    {
                        parametr: 'id',
                        type: 'objectid'
                    }
                ]
            }, req, res, version1.verification);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//POST
module.exports.recovery = (req, res) => {
    switch (String(req.body.v)) {
        case '1':
            validator({req_type: 'POST', for_auth: true, permissions: [config.admin_permissions.ACCESS_VERIFICATION_PASSWORD],
                variables: [
                    {
                        parametr: 'command',
                        type: 'string'
                    },
                    {
                        parametr: 'id',
                        type: 'objectid'
                    }
                ]
            }, req, res, version1.recovery);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}