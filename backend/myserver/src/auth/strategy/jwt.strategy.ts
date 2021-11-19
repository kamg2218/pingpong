import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { jwtConstants } from "src/config/jwt.config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/db/entity/User/User.entity";
import { UserRepository } from "src/db/repository/User.repository";
import { getCustomRepository } from "typeorm";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiratiron : false,
            secretOrKey : jwtConstants.secret,
        })
    }
    
    async validate(payload) : Promise<User> {
        const repo_user = getCustomRepository(UserRepository);
        const user = await repo_user.findOne({userid : payload.userid});
        if (!user)
            throw new UnauthorizedException();
        return user;
    }
}