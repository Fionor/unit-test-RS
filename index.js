require('dotenv').load();

require('./db');
require('./models/groups');
require('./models/students');
require('./models/teachers');
require('./models/tests');
require('./models/users');
require('./models/photos');
const rate_limit = require('express-rate-limit');
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app, {
    serveClient: false
});
const debug = require('debug')('Express4');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const logger = require('morgan');

const config = require('./config');

const routes = require('./routes/index');

app.set('port', process.env.PORT || config.resourse_server.port);
const api_limiter = new rate_limit({
    windowMs: 5*60*1000, // 5 minutes
    max: 100,
    delayMs: 0 // disabled
  });
app.use(logger('dev'));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', api_limiter, cors(), routes);

app.use(function(req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const server = http.listen(app.get('port'), ()=>{
    debug('Express server listening on port ' + server.address().port);
})