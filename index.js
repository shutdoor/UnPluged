const express = require('express');
const app = express();
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes');
const favicon = require('serve-favicon');
const config = require('./config');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname + '/public')));


const urlencodedParser = bodyParser.urlencoded({
    extended: true
});


app.get('/', routes.index);



app.listen(3000);