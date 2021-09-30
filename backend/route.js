const passport = require('passport');
const router = require('express').Router();
// import passport from 'passport';

router.post('/api/login', passport.authenticate('local', {
    failureRedirect: '/'
}), (req, res)=>{
    res.redirect('/');
});