// import { env } from "process";
import dotenv from 'dotenv'
export const ENV_PATH='./src/.env';
const ENV = dotenv.config({path : ENV_PATH});

export const BACK_DOMAIN = ENV.parsed.BACK_DOMAIN
const FRONT_URL = ENV.parsed.FRONT_URL
//const FRONT_URL = ""
export const CORS_ORIGIN = [];


const frontSignupPage = FRONT_URL + "/nickandprofile"
const frontLobyPage = FRONT_URL + "/game"
const frontTwoFactorAuthenticationPage = FRONT_URL + "/twofactor"

export {frontSignupPage, frontLobyPage, frontTwoFactorAuthenticationPage}