const mongoose = require('mongoose');
const ObjectId = mongoose.mongo.ObjectId;
const Tests = mongoose.model('tests');
const Photos = mongoose.model('photos');
const Teachers = mongoose.model('teachers');

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
    
        const test = await Tests.create({name: req.body.name, for_groups: req.body.for_groups, variants: req.body.variants});
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
        await Teachers.findOneAndUpdate({user_id: res.token.user.id}, {"$push": {created_tests: {id: test._id}}}).exec();
        return res.send({status: 200, response: [{test_id: test._id}]}); 
    } catch (error) {
        console.log('tests.create', error);
        res.send({status: 500, error: {error_msg: error}});
    }
}