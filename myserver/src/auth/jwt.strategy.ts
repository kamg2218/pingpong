import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { jwtConstants } from "./constants";
import { ExtractJwt, Strategy } from "passport-jwt";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiratiron : false,
            secretOrKey : jwtConstants.secret,
        })
        
    }

    /*handleRequest(err: any, user: any, info: any, context: any, status: any){
        console.log('errorGuard', err);
        if (err || !user) {
            throw new HttpException(err.message, err.status);
        }
        return user;
    }*/
    
    async validate(payload : any) {
        console.log("validate");
        return {id : payload.id};
    }
}