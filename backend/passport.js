require("dotenv").config();
const passport = require('passport');
const FortyTwoStrategy = require('passport-42');
const env = process.env;

passport.serializeUser(function(user, done){
    console.log('Serialize User', user);
    return done(null, user);
});
passport.deserializeUser(function(user, done){
    console.log("deserializeUser!");
    done(null, user);
});

const FortyTwoOpt = {
    clientID: env.FORTYTWO_APP_ID,
    clientSecret: env.FORTYTWO_APP_SECRET,
    callbackURL: env.CALLBACK_URL,
    passReqToCallback: true,
};

FortyTwoVerify = (req, accessToken, refreshToken, profile, cb) =>{
    const user = {
        username: profile.username,
        displayname: profile.displayName,
        email: profile.emails[0].value,
        userid: profile.id,
        access: accessToken,
        refresh: refreshToken,
    };
    // console.log(user);
    // console.log(profile);
    console.log(`accessToken : ${accessToken}`);
    console.log(`refreshToken: ${refreshToken}`);
    return cb(null, user);
}

module.exports = () => {
    passport.use(new FortyTwoStrategy(FortyTwoOpt, FortyTwoVerify));
}