const mongoose = require('mongoose');
const Tests = mongoose.model('tests');
const Students = mongoose.model('students');
const Teachers = mongoose.model('teachers');
const Users = mongoose.model('users');

//GET
module.exports.get_avaliable_test = async (req, res) => {
    try {
        const student = await Students.findOne({user_id: res.token.user.id}).exec();
        const tests = await Tests.find({for_groups: String(student.group_id), state: 'in_progress', subscribers: {$nin: [res.token.user.id]}}).exec();
        let response = await Promise.all(tests.map(async test => {
            const teacher = await Teachers.findOne({created_tests: test._id}).exec();
            const user = await Users.findById(teacher.user_id);
            return {id: test._id, created_at: test.created_at, name: test.name, teacher: user.fio}
        }));
        res.send({status: 200, response})
    } catch (error) {
        console.log('students.set_answer', error);
        res.send({status: 500, error: {error_msg: error}})
    }
}

// POST
module.exports.set_answer = async (req, res) => {
    try {
        if( res.token.user.role != 'student' ) {
            return res.send({status: 401, error: {error_msg: "invalid role"}});
        }
        const test = await Tests.findOne({_id: req.body.test_id}).lean().exec();
        if(test.state == 'not_defined'){
            return res.send({status: 400, error: {error_msg: 'test not defined'}})
        }
        let student = await Students.findOne({user_id: res.token.user.id}).lean().exec();
        const subscribed_test = student.testsSubscribes.filter(test => test.test_id == req.body.test_id);
        
        if(subscribed_test.length == 0){
            return res.send({status: 400, error: {error_msg: 'invalid test id'}})
        }
        if(test.state == 'complited' || subscribed_test[0].test_complited){
            return res.send({status: 400, error: {error_msg: 'test complited'}});
        }
        if(subscribed_test[0].questions.length >= test.variants[subscribed_test[0].variant].questions.length) {
            return res.send({status: 400, error: {error_msg: 'test complited'}});
        }
        await Students.findOneAndUpdate({user_id:  res.token.user.id, "testsSubscribes.test_id": req.body.test_id}, {"$push": {"testsSubscribes.$.questions": req.body.answer}}).lean().exec();        
        let variant;
        
        //const newStatistic = await getStatistic( res.token.id, req.body.test_id);
        //io.to(req.body.test_id).emit('updateStatistic', {...newStatistic});
        res.send({status: 200, response: []});
    } catch (e) {
        console.log('students.set_answer', e);
        res.send({status: 500, error: {error_msg: e}})
    }
}

//POST
module.exports.begin_testing = async (req, res) => {
    try {
        if( res.token.user.role != 'student' ) {
            return res.send({status: 401, error: {error_msg: "invalid role"}});
        }
        const test = await Tests.findOne({_id: req.body.test_id}).lean().exec();
        const student = await Students.findOne({user_id: res.token.user.id}).lean().exec();
        if(test.subscribers.indexOf(student.user_id) == -1 && test.for_groups.indexOf(String(student.group_id)) != -1){
            await Tests.findOneAndUpdate({_id: req.body.test_id}, {"$push": {subscribers: student.user_id}}).lean().exec();
            await Students.findOneAndUpdate({user_id: res.token.user.id}, {"$push": {testsSubscribes: {test_id: req.body.test_id, questions: [], test_complited: false, variant: req.body.variant}}}).lean().exec();
            //const newStatistic = await getStatistic( res.token.id, req.body.test_id);
            //io.to(req.body.test_id).emit('updateStatistic', {...newStatistic});
            res.send({status: 200});
        } else {
            res.send({status: 400, error: {error_msg: 'invalid test'}});
        }
    } catch (e) { 
        console.log('students.begin_testing', e);
        res.send({status: 500, error: {error_msg: e}})
    }
}
