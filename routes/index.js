const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const ctrl_users = require('../controllers/users/');
const ctrl_tests = require('../controllers/tests/');
const ctrl_photos = require('../controllers/photos/');

router.get('/users.get', ctrl_users.get);
router.get('/users.password_check', ctrl_users.password_check);
router.post('/users.create', ctrl_users.create);

router.post('/tests.create', ctrl_tests.create);

router.get('/photos.get', ctrl_photos.get);
router.post('/photos.create', upload.fields([{name: 'photo'}]), ctrl_photos.create);


module.exports = router;