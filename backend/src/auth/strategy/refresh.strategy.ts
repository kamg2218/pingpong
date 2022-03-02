import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-custom'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt';
import { getCustomRepository } from "typeorm";
import { jwtConstants } from "src/config/jwt.config";
import { UserRepository } from "src/db/repository/User/UserCustomRepository";

const AUTH_HEADER = 'authorization';
const BEARER_AUTH_SCHEME = 'bearer';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {

    constructor(private  jwtService : JwtService) {
        super()
    }

    parseAuthHeader(hdrValue) {
        const re = /(\S+)\s+(\S+)/;
        if (typeof hdrValue !== 'string') {
            return null;
        }
        var matches = hdrValue.match(re);
        return matches && { scheme: matches[1], value: matches[2] };
    }

    extractor(req : Request) {
        let token = null;
        let auth_scheme = BEARER_AUTH_SCHEME.toLowerCase();
        let auth_hdr = req.headers[AUTH_HEADER]
        if (req.headers[AUTH_HEADER]) {
            const auth_params = this.parseAuthHeader(auth_hdr);
            if (auth_params && auth_scheme === auth_params.scheme.toLowerCase()) {
                token = auth_params.value;
            }
        }
        return token;
    }

    verifyToken(token) { 
        const options = {
            secret : jwtConstants.secret,
            signOptions : {expiresIn : jwtConstants.refresh_expiresIn},
        }
        return this.jwtService.verify(token, options);
    }

    async validate(req : Request) {
        const token = this.extractor(req);
        const res = this.verifyToken(token);
        if (!res)
            throw new UnauthorizedException()
        const repo_user = getCustomRepository(UserRepository)
        const user = await repo_user.findOne({refreshToken : token})
        if (!user)
            throw new UnauthorizedException()
        return user;
    }
}