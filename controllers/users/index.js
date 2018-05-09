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