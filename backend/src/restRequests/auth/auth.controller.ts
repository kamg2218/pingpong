import { Body, Controller, Delete, Get, Logger, Post, Query, Req, Res, UnauthorizedException, UseGuards, UsePipes} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/db/entity/User/UserEntity';
import { AuthGuard } from '@nestjs/passport';
import { UserDeco } from 'src/type/user.decorator';
import { frontLobyPage, frontSignupPage, frontTwoFactorAuthenticationPage} from 'src/config/url';
import { Request, Response } from 'express';
import { SignUpDTO } from 'src/type/signup.dto';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from 'src/db/repository/User/User.repository';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService : AuthService, 
        private readonly logger : Logger,
    ) {}

    @Post('signup')
    @UseGuards(AuthGuard('jwt-2fa'))
    async signup(@Req() req : Request, @Res({passthrough : true}) res : Response, @UserDeco() user : User, @Body() data : SignUpDTO) {
        await this.authService.register(user.userid, data);
        this.logger.log("[Signup] New user has signed up.");
        return true;
    }

    /* 42 intra 로그인 화면 요청 */
    @Get('login')
    @UseGuards(AuthGuard('42'))
    temp() {
        console.log("42 TEST")

    }

    /* 1 성공하면 로비 */
    /* 2 2fa 면 0> */
    /* 3 닉네임 등록 */
    @Get('call')
    @UseGuards(AuthGuard('42'))
    async login( @Res({passthrough : true}) res : Response, @UserDeco() email: string) {
        let user = await this.authService.findUser(email);
        if (!user)
            user = await this.authService.createUser(email);
        const {accessToken, accessOptions, refreshToken, refreshOptions} = await this.authService.login(user);
        res.cookie('refreshToken', refreshToken, refreshOptions);
        res.cookie('accessToken', accessToken, accessOptions);
        this.logger.log(`[Login] ${user.nickname} has loggin in.`);
        if (user.nickname === user.email)
            return res.redirect(frontSignupPage);
        else if (user.isTwoFactorAuthenticationEnabled === true)
            return res.redirect(frontTwoFactorAuthenticationPage);
        else
            return res.redirect(frontLobyPage);
    }

    @Get('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Res({passthrough : true}) res : Response, @UserDeco() user : User) {
        await this.authService.logout(res, user);
        this.logger.log(`[logout] ${user.userid} logout.`);
    }
    
    @Post('issue')
    @UseGuards(AuthGuard('refresh')) //bearer에 refresh token
    async issueAT(@Res({passthrough : true}) res : Response, @UserDeco() user : User) {
        const {accessToken, ...accessOptions} = this.authService.getCookieWithJwtAccessToken(user.userid, true);
        res.cookie('accessToken', accessToken, accessOptions);
        this.logger.log(`[Issue] ${user.userid} has been reissued AT.`);
    }

    // 회원 탈퇴
    @Delete('delete')
    @UseGuards(AuthGuard('jwt'))
    async withdrawal(@Res({passthrough : true}) res : Response, @UserDeco() user : User) {
        await this.authService.deleteUser(res, user);
        this.logger.log("[Delete] success");
    }

    // 중복 확인
    @Get('check')
    async checkDuplicateNick(@Query('nickname') nickname : string) {
        const res = await this.authService.isDuplicate(nickname);
        this.logger.log(`[Check] Check if ${nickname} is duplicate`);
        return {message : res};
    }


    @Post('force_login')
    async forceLogin(@Res({passthrough : true}) res : Response, @Body('nickname') nickname : string) {
        const repo_user = getCustomRepository(UserRepository);
        let user = await repo_user.findOne({nickname : nickname});
        if (!user)
            throw new UnauthorizedException("no such user");
        const {accessToken, accessOptions, refreshToken, refreshOptions} = await this.authService.login(user);
        res.cookie('refreshToken', refreshToken, refreshOptions);
        res.cookie('accessToken', accessToken, accessOptions);
        this.logger.log(`[Login] ${user.nickname} has loggin in.`);
        if (user.isTwoFactorAuthenticationEnabled === true)
            return false;
        else
            return true;
    }
}