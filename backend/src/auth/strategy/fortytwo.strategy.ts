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
        // const repo_user = getCustomRepository(UserRepository);
        // const repo_rest = getRepository(RestrictedList)
        // const email = raw[2]._json.email;
        // const restricted_email = await repo_rest.findOne({email : email});
        // if (restricted_email)
        //     throw new BadRequestException();
        //     console.log("here1")
        // const user = await repo_user.findOne({email : email});
        // console.log("here2")
        // if (user === undefined)               // db에 있는지 확인
        //     console.log("here3")
        //     throw new NotFoundUserException(email);
        // if (await repo_user.didBanLogin(user))
        // console.log("here4")
        //     throw new BadRequestException();
        // if (user.status === "login")      // 로그인이 되어있는데 요청을 했을 경우
        //     throw new BadRequestException();
        // return user;
    }
}
