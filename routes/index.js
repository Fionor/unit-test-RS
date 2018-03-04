const express = require('express');
const router = express.Router();

const ctrl_users = require('../controllers/users');

router.get('/users.get', ctrl_users.get);
router.post('/users.create', ctrl_users.create);

module.exports = router;