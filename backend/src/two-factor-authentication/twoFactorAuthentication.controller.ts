import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UserDeco } from 'src/type/user.decorator';
import { User } from 'src/db/entity/User/User.entity';
import { Body, Controller, HttpCode, Logger, Post, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from 'src/auth/auth.service';

@Controller('2fa')
@ApiTags('2FA API')
export class TwoFactorAuthenticationController {
    constructor(
        private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
        private readonly authService: AuthService,
        private readonly logger : Logger
    ) {}

        @Post('generate')
        @UseGuards(AuthGuard('jwt'))
        @ApiOperation({ summary: '2fa qr코드 생성', description: '2fa qr코드 생성'})
        @ApiResponse({status : 201, description : "qr코드 생성 성공"})
        @ApiCookieAuth("accessToken")
        async register(@UserDeco() user : User) {
            const otpauthUrl = await this.twoFactorAuthenticationService.generateTwoFactorAuthnticateSecret(user);
            this.logger.log("2fa generate success");
            return await this.twoFactorAuthenticationService.pipeQrCodeStream(otpauthUrl);
        }

        @Post('turn-on')
        @HttpCode(200)
        @UseGuards(AuthGuard('jwt'))
        @ApiOperation({ summary: '2fa 활성화', description: '2fa 인증 성공 후에 활성화됨 '})
        async turnOnTwoFactorAuthentication(@Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode : string , @UserDeco() user : User) {
            const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, user);
            if (!isCodeValid)
                throw new UnauthorizedException('Wrong authentication code');
            await this.twoFactorAuthenticationService.turnOnTwoFactorAuthentication(user.userid);
            this.logger.log(`[turn-on] 2fa turned-on ${user.userid}`);
        }

        @Post('turn-off')
        @HttpCode(200)
        @UseGuards(AuthGuard('jwt'))
        @ApiOperation({ summary: '2fa 비활성화', description: '2fa 인증 성공 후에 비활성화됨 '})
        async turnOffTwoFactorAuthentication(@Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode : string , @UserDeco() user : User) {
            const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, user);
            if (!isCodeValid)
                throw new UnauthorizedException('Wrong authentication code');
            await this.twoFactorAuthenticationService.turnOffTwoFactorAuthentication(user.userid);
            this.logger.log(`[turn-off] 2fa turned-off ${user.userid}`);
        }


        @Post('authenticate')
        @HttpCode(200)
        @UseGuards(AuthGuard('jwt-2fa'))
        @ApiOperation({ summary : '2fa 인증', description : '2fa 인증 성공 후 로그인 처리'})
        async authenticate (@Res({passthrough : true}) res : Response, @Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode : string, @UserDeco() user : User) {
            const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, user);
            if (!isCodeValid)
                throw new UnauthorizedException('Wrong authentication code');
            const {accessToken, ...accessOptions} = this.authService.getCookieWithJwtAccessToken(user.userid, true);
            res.cookie('accessToken', accessToken, accessOptions);
            res.end();
            this.logger.log("[authenticate] 2fa authenticate success!");
        }
}