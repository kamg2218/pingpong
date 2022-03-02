import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { jwtConstants } from "src/config/jwt.config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";
import {TokenPayload} from 'src/type/PayLoad.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly authService : AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                  return request?.cookies?.accessToken;
                },
              ]),
            ignoreExpiratiron : false,
            secretOrKey : jwtConstants.secret,
        })
    }
    
    async validate(payload : TokenPayload) {
        return this.authService.validateJwt(payload);
    }
}