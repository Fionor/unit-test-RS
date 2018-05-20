const version1 = require('./versions/v1');
const validator = require('../../validator/');
const config = require('../../config')
//GET
module.exports.get = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET',
                variables: [
                ]
            }, req, res, version1.get);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//POST
module.exports.create = (req, res) => {
    switch (String(req.body.v)) {
        case '1':
            validator({req_type: 'POST', for_auth: true, permissions: [config.admin_permissions.ACCESS_CREATE_GROUPS],
                variables: [
                    {
                        parametr: 'name',
                        type: 'string'
                    }
                ]
            }, req, res, version1.create);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//POST
module.exports.delete = (req, res) => {
    switch (String(req.body.v)) {
        case '1':
            validator({req_type: 'POST', for_auth: true, permissions: [config.admin_permissions.ACCESS_CREATE_GROUPS],
                variables: [
                    {
                        parametr: 'id',
                        type: 'objectid'
                    }
                ]
            }, req, res, version1.delete);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}