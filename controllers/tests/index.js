const version1 = require('./versions/v1');
const validator = require('../../validator/');

//GET
module.exports.get_created = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET', for_auth: true, for_role: 'teacher',
                variables: []
            }, req, res, version1.get_created);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//GET
module.exports.get_one = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET', for_auth: true, for_role: 'teacher',
                variables: [
                    {
                        parametr: 'id',
                        type: 'objectid'
                    }
                ]
            }, req, res, version1.get_one);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//GET
module.exports.get_next_step = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET', for_auth: true, for_role: 'student',
                variables: [
                    {
                        parametr: 'id',
                        type: 'objectid'
                    }
                ]
            }, req, res, version1.get_next_step);
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
            validator({req_type: 'POST', for_auth: true, for_role: 'teacher',
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

module.exports.remove = (req, res) => {
    switch (String(req.body.v)) {
        case '1':
            validator({req_type: 'POST', for_auth: true, for_role: 'teacher',
                variables: [
                    {
                        parametr: 'id',
                        type: 'objectid',
                    }
                ]
            }, req, res, version1.remove);
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

module.exports.get_users_statistic = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET', for_auth: true,
                variables: [
                    {
                        parametr: 'test_id',
                        type: 'objectid',
                    },
                    {
                        parametr: 'student_id',
                        type: 'objectid',
                    }
                ]
            }, req, res, null).then(data => {
                version1.get_users_statistic(req.query.student_id, req.query.test_id).then(result => {
                    res.send({status: 200, response: [result]})
                })
            });
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}