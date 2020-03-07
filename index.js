const express = require('express');
const app = express();
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes');
// const favicon = require('serve-favicon');
const config = require('./config');

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname + '/public')));

const urlencodedParser = bodyParser.urlencoded({
    extended: true
});

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/feed', routes.main);
app.get('/createTextPost', routes.createTextPost);
app.get('/comment', routes.comment);
app.get('/signup', routes.userCreator);
app.get('/createImagePost', routes.createImagePost);
app.post('/signup', urlencodedParser, routes.createUser);
app.post('/feed', urlencodedParser,routes.vote);
app.post('/textpost', urlencodedParser,routes.uploadPost);
app.post('/imagepost', urlencodedParser, routes.uploadImage);
app.post('/comment', urlencodedParser, routes.createComment);
app.get('/tagsPage', routes.tags);
app.listen(3000);