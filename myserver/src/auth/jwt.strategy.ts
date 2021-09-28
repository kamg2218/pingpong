import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { jwtConstants } from "src/config/jwt.config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JWT_PAYLOAD } from "src/Type/Payload.type";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiratiron : false,
            secretOrKey : jwtConstants.secret,
        })
        
    }
    
    async validate(payload : JWT_PAYLOAD) : Promise<JWT_PAYLOAD>{
        // expire 된거 확인 어떻게 하지? 
        if (payload)
            return {
                type : "refresh",
            }
        return {
            type : "access",
            id : payload.id};
    }
}