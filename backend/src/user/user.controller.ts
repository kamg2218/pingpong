import { Controller, Get, Query, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "src/auth/auth.service";
import { UserService } from "./user.service";
import { Cookies } from "src/auth/cookies.decorator";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService : UserService,
        private readonly jwtService : JwtService,
        private readonly authService : AuthService
    
    ) {}

    @Get('/check')
    async checkState(@Query('url') urlvalue : any, @Cookies('accessToken') at : string) {
        try {
            if (at)
                console.log("AT OK")
            else
                console.log("AT X")
            const payload = await this.jwtService.verify(at);
            const user = await this.authService.validate2FAJwt(payload);
            let state : string;
            if (user.isTwoFactorAuthenticationEnabled && !payload.isSecondFactorAuthenticated)
                state = "2fa";
            else
                state = await this.userService.findState(user);
            console.log("state : ", state);
            console.log("url : ", urlvalue);
            return {state};
        }
        catch (e) {
            if (urlvalue === "main") {
                console.log("state : logout");
                return {state : "logout"};
            }
            else {
                console.log("state : 401, url : ", urlvalue);
                console.log(e);
                throw new UnauthorizedException("user state");
            }
                
        }
    }
}