import { Injectable } from "@nestjs/common";
import { User } from "src/db/entity/User/UserEntity";
import { authenticator } from 'otplib'
import { Response } from "express";
import { toString, toFileStream } from 'qrcode'
import { getCustomRepository } from "typeorm";
import { UserRepository } from "src/db/repository/User/UserCustomRepository";



@Injectable()
export class TwoFactorAuthenticationService {
    constructor(
    ) {}

    async setTwoFactorAthenticationSecret(secret : string, userid : string) {
        const repoUser = getCustomRepository(UserRepository);
        await repoUser.update(userid, {twoFactorAuthenticationSecret : secret})
    }

    public async generateTwoFactorAuthnticateSecret(user : User) {
        const TWO_FACTOR_AUTHENTICATION_APP_NAME = 'pong game'  //config
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email, 
            TWO_FACTOR_AUTHENTICATION_APP_NAME, secret);
        await this.setTwoFactorAthenticationSecret(secret, user.userid)
        return otpauthUrl;
    }

    async turnOnTwoFactorAuthentication(userId : string) {
        const repo_user = getCustomRepository(UserRepository);
        return repo_user.update(userId, {isTwoFactorAuthenticationEnabled : true});
    }

    async turnOffTwoFactorAuthentication(userId : string) {
        const repo_user = getCustomRepository(UserRepository);
        return repo_user.update(userId, {isTwoFactorAuthenticationEnabled : false});
    }

    public async pipeQrCodeStream(res : Response, otpauthUrl : string) {
        // return toFileStream(res, otpauthUrl);
        const x = toString(otpauthUrl);
        console.log(x);
    }

    public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode : string, user : User) {
        return authenticator.verify({
            token : twoFactorAuthenticationCode,
            secret : user.twoFactorAuthenticationSecret
        })
    }

}