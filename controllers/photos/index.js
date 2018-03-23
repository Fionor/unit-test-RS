const version1 = require('./versions/v1');
const validator = require('../../validator/');

module.exports.get = (req, res) => {
    switch (req.query.v) {
        case '1':
            validator({
                req_type: 'GET',
                variables: [
                    {
                        parametr: 'photo_id',
                        type: 'objectid'
                    }
                ]

            }, req, res, version1.get)
            break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
            break;
    }
}

module.exports.create = (req, res) => {
    console.log(req.body)
    switch (String(req.body.v)) {
        case '1':
            validator({
                req_type: 'POST', for_auth: true,
                variables: [
                    {
                        parametr: 'photo',
                        type: 'file'
                    }
                ]
            }, req, res, version1.create)
            break;

        default:
            return res.send({status: 400, error: {error_msg: "invalid version"}});
            break;
    }
}