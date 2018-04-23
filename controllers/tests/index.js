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