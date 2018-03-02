const express = require('express');
const router = express.Router();

const ctrl_users = require('../controllers/users');

router.get('/users.get', ctrl_users.get);

module.exports = router;