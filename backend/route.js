const express = require('express');
const router = express.Router();
const passport = require('passport');
const {authCheck} = require('./auth');
// import {authCheck} from "./auth";

router.get('/auth/login', passport.authenticate('42'));
router.get('/', authCheck, function(req, res, next){
    console.log('user', req.user);
    res.json({ test: req.user });
});
router.get(
    "/auth/login/callback",
    passport.authenticate("42", {
        // successMessage: "LOGIN SUCCESS!",
        // successRedirect: "http://localhost:3000/game",
        failureMessage: "LOGIN FAILED :(",
        failureRedirect: "http://localhost:3000",
    }),
    function(req, res){
        res.cookie('accessToken', "hi", { maxAge: 300000 });
        res.redirect('http://localhost:3000/game');
    }
);

router.get('/login/logout', (req, res, next)=>{
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
});
router.post('/auth/signup', (req, res, next)=>{
    console.log(req.body);
    console.log(req.cookies);

    // res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    // res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested With, Content-Type, Accept');
    
    // res.setHeader['Access-Control-Allow-Origin', `http://localhost:4242`];
    res.cookie('accessToken', "hi", { maxAge: 300000 });
    // res.redirect(200, 'http://localhost:3000/game');
    res.setHeader('content-type', 'text/plain');
    res.send('cookie set');
});
router.get('/auth/check', (req, res, err)=>{
    // console.log(req.query);
    // console.log(req.query.nickname);
    // console.dir(req.cookies);
    if (req.query.nickname === 'hazel')
        res.send('Checked!');
    else
        res.send('Failed!');
});

module.exports = router;
