const express = require('express');
const path = require('path');
const session = require('express-session');
const route = require('./route.js');
const passport = require('passport');
const passportConfig = require('./passport.js');
const app = express();

const hostname = 'localhost';
const port = '4242';

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'html'));

app.use(session({secret: 'secret', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

passportConfig();

app.use(express.static(path.join(__dirname, 'html')));
app.use('/', route);

app.listen(4242, ()=>{
    console.log(`Server running at http://${hostname}:${port}/`);
});