import dotenv from 'dotenv'
const ENV = dotenv.config({path : './src/.env'});

export const FortyTwoOAuthConfig = {
    clientID : ENV.parsed.FT_CLIENT_ID,
    clientSecret : ENV.parsed.FT_CLIENT_SECRET,
    callbackURL : ENV.parsed.FT_CALLBACK_URL,
    scope : ENV.parsed.FT_SCOPE
};