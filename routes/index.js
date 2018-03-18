const express = require('express');
const router = express.Router();

const ctrl_users = require('../controllers/users/');

router.get('/users.get', ctrl_users.get);
router.get('/users.password_check', ctrl_users.password_check);
router.post('/users.create', ctrl_users.create);


module.exports = router;