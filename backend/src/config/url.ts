// import { env } from "process";
import dotenv from 'dotenv'
const ENV = dotenv.config();


export const BACK_DOMAIN = ENV.parsed.BACK_DOMAIN
const FRONT_URL = ENV.parsed.FRONT_URL
export const CORS_ORIGIN = [];


const frontSignupPage = FRONT_URL + "/nickandprofile"
const frontLobyPage = FRONT_URL + "/game"
const frontTwoFactorAuthenticationPage = FRONT_URL + "/twofactor"

export {frontSignupPage, frontLobyPage, frontTwoFactorAuthenticationPage}