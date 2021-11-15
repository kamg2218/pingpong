const express = require('express');
const router = express.Router();
const passport = require('passport');
const {authCheck} = require('./auth');

router.get('/auth/login', passport.authenticate('42'));
router.get('/', authCheck, function(req, res, next){
    console.log('user', req.user);
    res.json({ test: req.user });
});
router.get(
    "/auth/login/callback",
    passport.authenticate("42", {
        successMessage: "LOGIN SUCCESS!",
        successRedirect: "http://localhost:3000/game",
        // successRedirect: "/login/success",
        failureMessage: "LOGIN FAILED :(",
        failureRedirect: "http://localhost:3000",
        // failureRedirect: "/login/failure"
    })
);

router.get("/login/success", authCheck, function(req, res, next){
    res.json({msg: "hi"});
});
router.get("/login/failure", authCheck, function(req, res, err){
    res.json({msg: "TT"});
});
router.get('/login/logout');
router.post('/auth/signup', (req, res, err)=>{
    console.log(req.body);
    res.send('Made signup!');
    // res.redirect('http://localhost:3000/game', 200);
    //console.log('auth Signup!');
    //console.log(e);
});
router.get('/auth/check', (req, res, err)=>{
    console.log(req.query);
    console.log(req.query.nickname);
    if (req.query.nickname === 'hazel')
        res.send('Checked!');
    else
        res.send('Failed!');
});

module.exports = router;
