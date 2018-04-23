const mongoose = require('mongoose');
const Tests = mongoose.model('tests');
const Students = mongoose.model('students');

// POST
module.exports.set_answer = async (req, res) => {
    try {
        if( res.token.user.role != 'student' ) {
            return res.send({status: 401, error: {error_msg: "invalid role"}});
        }
        const test = await Tests.findOne({_id: req.body.test_id}).lean().exec();
        let student = await Students.findOne({user_id: res.token.user.id}).lean().exec();
        const subscribed_test = student.testsSubscribes.filter(test => test.test_id);
        if(subscribed_test.length == 0){
            return res.send({status: 400, error: {error_msg: 'invalid test id'}})
        }
        if(test.state == 'complited' || subscribed_test[0].test_complited){
            return res.send({status: 400, error: {error_msg: 'test complited'}});
        }
        await Students.findOneAndUpdate({user_id:  res.token.user.id, "testsSubscribes.test_id": req.body.test_id}, {"$push": {"testsSubscribes.$.questions": req.body.answer}}).lean().exec();        
        let variant;
        student = await Students.findOne({user_id: res.token.user.id}).lean().exec();
        const curentQuestons = student.testsSubscribes.reduce((acc, test) => {
            if( String(test.test_id).trim() == String(req.body.test_id).trim()){
                variant = test.variant;
                return test.questions.length
            }
        }, 0);
        console.log(curentQuestons);
        if(curentQuestons == test.variants[variant].questions.length){
            await Students.findOneAndUpdate({user_id: res.token.user.id, "testsSubscribes.test_id": req.body.test_id}, {"$set": {"testsSubscribes.$.test_complited": true}}).lean().exec();
            console.log('test complited');
        }
        //const newStatistic = await getStatistic( res.token.id, req.body.test_id);
        //io.to(req.body.test_id).emit('updateStatistic', {...newStatistic});
        res.send({status: 200, response: [{complited: curentQuestons == test.variants[variant].questions.length}]});
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
        if(test.subscribers.indexOf(student.user_id) == -1 && test.for_groups.indexOf(student.group) != -1){
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
