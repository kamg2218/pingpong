import { BadRequestException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-custom'
import { AuthService } from "../auth.service";
import { Request } from 'express'

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy, 'custom') {

    constructor(private authService : AuthService) {
        super()
    }

    async validate(req : Request) : Promise<string> {
        console.log("test : custom validate")
        const emailid = req.cookies['_pongTempEmailId'];
        const res = await this.authService.searchEmail(emailid);
        if (!res)
            throw new BadRequestException()
        return res;
    }
}