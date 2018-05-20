const mongoose = require('mongoose');
const Group = mongoose.model('groups');
const Student = mongoose.model('students');

//GET
module.exports.get = async (req, res) => {
    try {
        let groups = await Group.find({}).exec();
        groups = await Promise.all(groups.map( async group => {
            const members = await Student.find({group_id: group._id}).count().exec();
            return {
                id: group._id,
                name: group.name,
                members
            }
        }));
        res.send({status: 200, response: [{groups}]});
    } catch (error) {
        console.error('groups.get', error);
        res.send(500, error);
    }
}

//POST
module.exports.create = async (req, res) => {
    try {
        const group = await Group.create({name: req.body.name}); 
        res.send({status: 200, response: [{
            group: {
                id: group.id,
                name: group.name
            }
        }]})       
    } catch (error) {
        console.error('groups.create', error);
        res.send(500, error);
    }
}

//POST
module.exports.delete = async (req, res) => {
    try {
        const members = await Student.find({group_id: req.body.id}).count().exec();
        if(members > 0){
            res.send({status: 400, errors: [
                {
                    error_msg: 'members > 0'
                }
            ]})
        } else {
            await Group.remove({_id: req.body.id}).exec();
            res.send({status: 200, response: []})
        }
    } catch (error) {
        console.error('groups.delete', error);
        res.send(500, error);
    }
}