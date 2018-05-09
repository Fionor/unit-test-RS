const version1 = require('./versions/v1');
const validator = require('../../validator/');

// POST
module.exports.create = (req, res) => {
    switch (String(req.body.v)) {
        case '1':
            validator({req_type: 'POST', for_auth: true,
                variables: [
                    {
                        parametr: 'for_groups',
                        type: 'array',
                        array_item: 'string'
                    },
                    {
                        parametr: 'name',
                        type: 'string'
                    },
                    {
                        parametr: 'variants',
                        type: 'array',
                        array_item: 'object'
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
module.exports.begin_testing = (req, res) => {
    switch (String(req.body.v)){
        case '1':
            validator({req_type: 'POST', for_auth: true, for_role: 'teacher',
                variables: [
                    {
                        parametr: 'id',
                        type: 'objectid',
                        array_item: 'string'
                    }
                ]
            }, req, res, version1.begin_testing);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
    
}

//POST
module.exports.end_testing = (req, res) => {
    switch (String(req.body.v)){
        case '1':
            validator({req_type: 'POST', for_auth: true, for_role: 'teacher',
                variables: [
                    {
                        parametr: 'id',
                        type: 'objectid',
                        array_item: 'string'
                    }
                ]
            }, req, res, version1.end_testing);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
    
}