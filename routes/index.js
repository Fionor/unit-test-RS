const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const ctrl_users = require('../controllers/users/');
const ctrl_students = require('../controllers/students');
const ctrl_tests = require('../controllers/tests/');
const ctrl_photos = require('../controllers/photos/');
const ctrl_groups = require('../controllers/groups');

router.get('/users.get', ctrl_users.get);
router.get('/users.password_check', ctrl_users.password_check);
router.get('/users.get_unverified_users', ctrl_users.get_unverified_users);
router.get('/users.get_recovery_password_status', ctrl_users.get_recovery_password_status);
router.get('/users.get_recovery_users', ctrl_users.get_recovery_users);
router.post('/users.create', ctrl_users.create);
router.post('/users.set_permissions', ctrl_users.set_permissions);
router.post('/users.recovery_password', ctrl_users.recovery_password);
router.post('/users.verification', ctrl_users.verification);
router.post('/users.recovery', ctrl_users.recovery);

router.get('/tests.get_created', ctrl_tests.get_created);
router.get('/tests.get_one', ctrl_tests.get_one);
router.get('/tests.get_next_step', ctrl_tests.get_next_step);
router.get('/tests.get_users_statistic', ctrl_tests.get_users_statistic)
router.post('/tests.save', ctrl_tests.create);
router.post('/tests.remove', ctrl_tests.remove);
router.post('/tests.begin_testing', ctrl_tests.begin_testing);
router.post('/tests.end_testing', ctrl_tests.end_testing);

router.get('/photos.get', ctrl_photos.get);
router.post('/photos.create', upload.fields([{name: 'photo'}]), ctrl_photos.create);

router.get('/students.get_avaliable_test', ctrl_students.get_avaliable_test);
router.get('/students.get_complited_tests', ctrl_students.get_complited_tests);
router.get('/students.get_in_progress_tests', ctrl_students.get_in_progress_tests);
router.post('/students.begin_testing', ctrl_students.begin_testing);
router.post('/students.set_answer', ctrl_students.set_answer);

router.get('/groups.get', ctrl_groups.get);
router.post('/groups.create', ctrl_groups.create);
router.post('/groups.delete', ctrl_groups.delete);


module.exports = router;