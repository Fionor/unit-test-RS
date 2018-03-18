const mongoose = require('mongoose');
const ObjectId = mongoose.mongo.ObjectId;

module.exports = (params, req, res, callback = (req, res) => {}) => {
    let errors = [];
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
                }
                break;
            case "POST":
                
                break;
        }
    }
    if(errors.length > 0){
        return res.send({status: 400, errors});
    } else {
        callback(req, res);
    }
}