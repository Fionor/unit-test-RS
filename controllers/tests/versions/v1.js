const mongoose = require('mongoose');
const ObjectId = mongoose.mongo.ObjectId;
const Tests = mongoose.model('tests');
const Photos = mongoose.model('photos');
const Teachers = mongoose.model('teachers');
const Students = mongoose.model('students');
const Users = mongoose.model('users');

//GET
module.exports.get_created = async (req, res) => {
    try {
        const teacher = await Teachers.findOne({user_id: res.token.user.id}).exec();
        const tests = await Tests.find({_id: {"$in": teacher.created_tests}}, {_id: true, subscribers: true, created_at: true, name: true, state: true}).exec();
        return res.send({status: 200, response: tests})
    } catch (error) {
        console.error('tests.get_created', error);
        res.send({status: 500, error: {error_msg: JSON.stringify(error)}});
    }
}

//GET
module.exports.get_one = async (req, res) => {
    try {
        const test = await Tests.findOne({_id: req.query.id}).exec();
        const teacher = await Teachers.findOne({user_id: res.token.user.id}).exec();
        if(teacher.created_tests.indexOf(test.id) != -1){
            return res.send({status: 200, response: [test]})
        } else {
            return res.send({status: 400, errors: [{error_msg: 'invalid test id or permissions denied'}]})
        }
    } catch (error) {
        console.error('tests.get_one', error);
        res.send({status: 500, error: {error_msg: JSON.stringify(error)}});
    }
}

//POST
module.exports.create = async (req, res) => {
    try {
        if( res.token.user.role != 'teacher' ) {
            return res.send({status: 401, error: {error_msg: "invalid role"}});
        }
    
        let errors = [];
        for (let i = 0; i < req.body.variants.length; i++) {
            if(req.body.variants[i].questions == undefined || req.body.variants[i].questions.length == 0){
                errors.push(`Variant ${i+1}: no questions`);
                continue;
            }
            for (let j = 0; j < req.body.variants[i].questions.length; j++) {
                if(req.body.variants[i].questions[j].name == undefined || req.body.variants[i].questions[j].name == ''){
                    errors.push(`Variant ${i+1} -> Question ${j+1}: missing question name`);
                }
                if(req.body.variants[i].questions[j].image_id == undefined || ( req.body.variants[i].questions[j].image_id != '' && !ObjectId.isValid(req.body.variants[i].questions[j].image_id) )){
                    errors.push(`Variant ${i+1} -> Question ${j+1}: image_id undefined ("" || "objectId")`);
                }
                if(req.body.variants[i].questions[j].answers == undefined || req.body.variants[i].questions[j].answers.length == 0){
                    errors.push(`Variant ${i+1} -> Question ${j+1}: no answers`);
                    continue;
                }
                let true_answers = 0;
                for (let l = 0; l < req.body.variants[i].questions[j].answers.length; l++) {
                    if(req.body.variants[i].questions[j].answers[l].text == undefined || req.body.variants[i].questions[j].answers[l].text == ''){
                        errors.push(`Variant ${i+1} -> Question ${j+1} -> Answer ${l+1}: no answer text`);
                    }
                    if(req.body.variants[i].questions[j].answers[l].right == undefined) {
                        errors.push(`Variant ${i+1} -> Question ${j+1} -> Answer ${l+1}: no answer right`);
                        continue;
                    }
                    if(req.body.variants[i].questions[j].answers[l].right == true) true_answers = true_answers + 1;
                }
                if(true_answers == 0 || true_answers > 1){
                    errors.push(`Variant ${i+1} -> Question ${j+1}: the question must have one correct answer`);
                }
            }
        }
        if (errors.length != 0) {
            return res.send({status: 400, errors: errors});
        }
        let test;
        if(!req.body._id) {
            test = await Tests.create({name: req.body.name, for_groups: req.body.for_groups, variants: req.body.variants});
            await Teachers.findOneAndUpdate({user_id: res.token.user.id}, {"$push": {created_tests: test._id}}).exec();
            
        }
        else {
            if(!ObjectId.isValid(req.body._id)) return res.send({status: 400, errors: [{error_msg: 'invalid test id'}]});
            test = await Tests.findById(req.body._id).exec();
            test.name = req.body.name,
            test.for_groups = req.body.for_groups;
            test.variants = req.body.variants;
            await test.save();
        }
        for (let i = 0; i < test.variants.length; i++) {
            for (let j = 0; j < test.variants[i].questions.length; j++) {
                if(test.variants[i].questions[j].image_id != ''){
                    const photo = await Photos.findById(test.variants[i].questions[j].image_id).exec();
                    if(photo == null) {
                        test.variants[i].questions[j].image_id = null;
                        await test.save();
                    }
                    if(photo.is_used == false){
                        photo.is_used = true;
                        await photo.save();
                    }
                }
            }
        }
        return res.send({status: 200, response: [{test_id: test._id}]}); 
    } catch (error) {
        console.error('tests.create', error);
        res.send({status: 500, error: {error_msg: error}});
    }
}

//POST
module.exports.remove = async (req, res) => {
    try {
        const test = await Tests.findById(req.body.id).exec();
        if(!test) return res.send({status: 400, errors: [{error_msg: 'invalid test id'}]});
        if(test.state == 'not_defined'){
            await test.remove();
            let teacher = await Teachers.findOne({user_id: res.token.user.id}).exec();
            teacher.created_tests = teacher.created_tests.filter(test_id => test_id != req.body.id);
            await teacher.save();
            return res.send({status: 200, response: []});
        } else {
            return res.send({status: 400, errors: [{error_msg: 'invalid test state'}]});
        }
    } catch (error) {
        console.error('tests.remove', error);
        res.send({status: 500, error: {error_msg: JSON.stringify(error)}});
    }
}

//POST
module.exports.begin_testing = async (req, res) => {
    try {
        const test = await Tests.findById(req.body.id).exec();
        
        if(test == null) {
            return res.send({status: 400, errors: [{error_msg: 'invalid test id'}]});
        } else if (test.state != "not_defined") {
            return res.send({status: 400, errors: [{error_msg: 'invalid test state'}]});
        } else {
            test.state = "in_progress";
            await test.save();
            return res.send({status: 200, response: [{test_id: test._id}]});
        }
    } catch (error) {
        console.error('tests.begin_testing', error);
        res.send({status: 500, error: {error_msg: JSON.stringify(error)}});
    }
}

//POST
module.exports.end_testing = async (req, res) => {
    try {
        const test = await Tests.findById(req.body.id).exec();
        if(test == null) {
            return res.send({status: 400, errors: [{error_msg: 'invalid test id'}]});
        } else if (test.state != "in_progress") {
            return res.send({status: 400, errors: [{error_msg: 'invalid test state'}]});
        } else {
            test.state = "complited";
            await test.save();
            return res.send({status: 200, response: [{test_id: test._id}]});
        }
    } catch (error) {
        console.error('tests.end_testing', error);
        res.send({status: 500, error: {error_msg: JSON.stringify(error)}});
    }
}

module.exports.get_next_step = async (req, res) => {
    try {
        const student = await Students.findOne({user_id: res.token.user.id});
        const test = await Tests.findById(req.query.id).exec();
        if(test.for_groups.indexOf(String(student.group_id)) == -1) {
            return res.send({status: 400, errors: [{error_msg: 'invalid teacher group'}]});
        }
        if(test.subscribers.indexOf(student.user_id) == -1) {
            return res.send({status: 200, response: [{status: 'not_begined', variants_count: test.variants.length}]});
        }
        const student_subscribe = student.testsSubscribes.filter(subs => subs.test_id == req.query.id)[0];
        if(test.state == 'complited' || student_subscribe.questions.length == test.variants[student_subscribe.variant].questions.length){
            student.testsSubscribes = student.testsSubscribes.map(subs => {
                if(subs.test_id == req.query.id){
                    subs.test_complited = true;
                }
                return subs;
            })
            await student.save();
            return res.send({status: 200, response:[{status: 'complited'}]})
        }
        const next_question = test.variants[student_subscribe.variant].questions[student_subscribe.questions.length];
        next_question.answers.map(answer => {
            delete answer.right;
            return answer;
        })
        res.send({status:200, response: [{status: 'testing', question: next_question}]});
    } catch (error) {
        console.error('tests.get_next_step', error);
        res.send({status: 500, error: {error_msg: JSON.stringify(error)}});
    }
}

module.exports.get_users_statistic = (student_id, test_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const student = await Students.findOne({user_id: student_id}).exec();
            const test = await Tests.findById(test_id).exec();
            const user = await Users.findById(student_id).exec();
            let questions = [];
            const subscribed_test = student.testsSubscribes.filter(test => test.test_id == test_id)[0];
            for (let i = 0; i < test.variants[subscribed_test.variant].questions.length; i++) {
                if(subscribed_test.questions[i] != undefined){
                    const name = test.variants[subscribed_test.variant].questions[i].name;
                    const text = test.variants[subscribed_test.variant].questions[i].answers[Number(subscribed_test.questions[i])].text;
                    const right = test.variants[subscribed_test.variant].questions[i].answers[Number(subscribed_test.questions[i])].right;
                    questions.push({name, text, right});
                }
            }
            const trueQuestions = questions.reduce((acc, qu) => {
                if(qu.right == true){
                    return ++acc;
                }
                else{
                    return acc;
                }
            }, 0);
            const success = (trueQuestions/test.variants[subscribed_test.variant].questions.length*100).toFixed(2);
            console.log('fio', user.fio)

            resolve({
                user_student_id: student.user_id,
                fio: user.fio,
                questions,
                true_answers: trueQuestions,
                success,
                variant: subscribed_test.variant
            });
        } catch (error) {
            console.error('tests.get_users_statistic', error);
            res.send({status: 500, error: {error_msg: JSON.stringify(error)}});
        }
    })
}