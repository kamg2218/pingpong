import { PassportStrategy } from "@nestjs/passport";
import {Strategy} from 'passport-42'
import { Injectable } from "@nestjs/common";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(){
        super({
            clientID : "ec2a017e9dd8ada1f0ef107f2ed75e7b166fecba09b252bb13859da4b4c5658d",
            clientSecret : "31c7953d97c8073453f8cec521823b86a02cea0492ef0b5f45fe5faed153e3d6",
            callbackURL : "http://localhost:3000/api/auth/42/test",
            scope : "public",
        });
    }

    async validate () {
        console.log("validate");
        return true;
    }
}

