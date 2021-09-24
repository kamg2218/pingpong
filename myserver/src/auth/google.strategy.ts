import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(){
        super({
            clientID: '789925077985-k7vtbqqfl9lka06iotimmftmlpqcd6i9.apps.googleusercontent.com',
            clientSecret : 'wJnM0iu-TjzuiXGSKMY6HS8q',
            callbackURL: 'http://localhost:3000/api/auth/google/test',
            scope : ['email', 'profile'],
        })
    }

    async validate (accessToken : string, refreshToken : string, profile : any, done : VerifyCallback) {
        const {name, emails, photos} = profile;
        //console.log(name, emails[0]);
        const user =  {
            email : emails[0].value,
            accessToken,
            refreshToken,
        }
        done(null, user);
    }
}