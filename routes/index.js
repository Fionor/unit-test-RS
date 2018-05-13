const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const ctrl_users = require('../controllers/users/');
const ctrl_students = require('../controllers/students');
const ctrl_tests = require('../controllers/tests/');
const ctrl_photos = require('../controllers/photos/');

router.get('/users.get', ctrl_users.get);
router.get('/users.password_check', ctrl_users.password_check);
router.get('/users.get_unverified_users', ctrl_users.get_unverified_users);
router.get('/users.get_recovery_password_status', ctrl_users.get_recovery_password_status);
router.post('/users.create', ctrl_users.create);
router.post('/users.set_permissions', ctrl_users.set_permissions);
router.post('/users.recovery_password', ctrl_users.recovery_password);

router.post('/tests.create', ctrl_tests.create);
router.post('/tests.begin_testing', ctrl_tests.begin_testing);
router.post('/tests.end_testing', ctrl_tests.end_testing);

router.get('/photos.get', ctrl_photos.get);
router.post('/photos.create', upload.fields([{name: 'photo'}]), ctrl_photos.create);

router.post('/students.begin_testing', ctrl_students.begin_testing);
router.post('/students.set_answer', ctrl_students.set_answer);


module.exports = router;