const express = require('express');
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes');
// const favicon = require('serve-favicon');
const config = require('./config');
const expressSession = require("express-session");
const cookieParser = require('cookie-parser');
const app = express();

var port = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname + '/public')));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(cookieParser());
app.use(expressSession({
    secret: "$$@@**W@rd!as",
    saveUninitialized: true,
    resave: true
}));


const urlencodedParser = bodyParser.urlencoded({
    extended: true
});

const checkAuth = (req, res, next) => {
    if (req.session.user != null) {
        if (req.session.user && req.session.user.isAuthenticated) {
            console.log(req.session.user);
            next();
        }
    } else {
        res.redirect('/login');
    }
}

//App Gets
app.get('/', routes.index);
app.get('/feed', routes.main);
app.get('/createTextPost', routes.createTextPost);
app.get('/createImagePost', routes.createImagePost);
app.get('/comment', routes.comment);
app.get('/signup', routes.userCreator);
app.get('/logout', routes.logout);
app.get('/login', routes.login);
app.get('/edit', routes.edit);

//App Posts
app.post('/signup', urlencodedParser, routes.createUser);
app.post('/feed', urlencodedParser, routes.vote);
app.post('/login',urlencodedParser, routes.loginUser);
app.post('/textpost', urlencodedParser, routes.uploadPost);
app.post('/imagepost', urlencodedParser, routes.uploadImage);
app.post('/comment', urlencodedParser, routes.createComment);
app.post('/edit', urlencodedParser, routes.editUser);

app.listen(port, () => console.log(`Server is currently running on port: ${port}`));