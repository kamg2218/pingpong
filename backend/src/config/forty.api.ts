import dotenv from 'dotenv'
import { ENV_PATH } from "src/config/url";

const ENV = dotenv.config({path : ENV_PATH});
export const FortyTwoOAuthConfig = {
    clientID : ENV.parsed.FT_CLIENT_ID,
    clientSecret : ENV.parsed.FT_CLIENT_SECRET,
    callbackURL : ENV.parsed.FT_CALLBACK_URL,
    scope : ENV.parsed.FT_SCOPE
};