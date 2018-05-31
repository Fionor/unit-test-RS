const version1 = require('./versions/v1');
const validator = require('../../validator/');

//GET
module.exports.get_avaliable_test = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET', for_auth: true, for_role: 'student',
                variables: []
            }, req, res, version1.get_avaliable_test);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//GET
module.exports.get_complited_tests = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET', for_auth: true, for_role: 'student',
                variables: []
            }, req, res, version1.get_complited_tests);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//GET
module.exports.get_in_progress_tests = (req, res) => {
    switch (String(req.query.v)) {
        case '1':
            validator({req_type: 'GET', for_auth: true, for_role: 'student',
                variables: []
            }, req, res, version1.get_in_progress_tests);
        break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
        break;
    }
}

//POST
module.exports.set_answer = (req, res) => {
    switch ( String(req.body.v) ) {
        case '1':
            validator({
                req_type: 'POST',
                for_auth: true,
                variables: [
                    {
                        parametr: 'test_id',
                        type: 'objectid'
                    },
                    {
                        parametr: 'answer',
                        type: 'number'
                    }
                ]
            }, req, res, version1.set_answer)
            break;
    
        default:
            res.send({status: 400, error: {error_msg: 'invalid version'}})
            break;
    }
}


//POST
module.exports.begin_testing = (req, res) => {
    switch(String(req.body.v)){
        case '1':
            validator({
                req_type: 'POST',
                for_auth: true,
                variables: [
                    {
                        parametr: 'variant',
                        type: 'number'
                    },
                    {
                        parametr: 'test_id',
                        type: 'objectid'
                    }
                ]
            }, req, res, version1.begin_testing)
            break;
        default:
            res.send({status: 400, error: {error_msg: 'invalid version'}})
            break;
    }
}