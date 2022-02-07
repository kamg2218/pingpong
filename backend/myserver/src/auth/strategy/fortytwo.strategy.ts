import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-42'
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import {FortyTwoOAuthConfig} from 'src/config/forty.api';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(){
        super({
            clientID : FortyTwoOAuthConfig.clientID,
            clientSecret : FortyTwoOAuthConfig.clientSecret,
            callbackURL : FortyTwoOAuthConfig.callbackURL,
            scope : FortyTwoOAuthConfig.scope,
            
        });
    }

    async validate (...raw) {
        const email = raw[2]._json.email;
        return email;
    }
}
