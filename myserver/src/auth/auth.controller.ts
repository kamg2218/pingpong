import { Controller, UseGuards, Post, Query, Get, Body, Headers} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {UserDeco} from './user.decorator';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService : AuthService){ }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    login(@UserDeco() user){
        //login 되어 있으면 다시 안되도록 처리하기 
        return this.authService.login(user);
    }

    @Post('signup')
    signup(@Body() {email, nickname, password}){   
        return this.authService.createUser(email, nickname, password);
    }

    @Get('check')
    async isDuplicate(@Query() {email, nickname} ){
        if (email)
            return await this.authService.isDuplicateEmail(email);
        else if (nickname)
            return await this.authService.isDuplicateNickname(nickname);
    }

    //@UseFilters(UnauthorizedExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get('logout')
    logout(@Headers('Authorization') at : string, @Headers('refresh_token') rt : string){      
        return this.authService.cleanAllToken(at, rt);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('issue')
    issueAT(@UserDeco() user){
        return this.authService.issueAT(user);
    }
    /*
    @UseGuards(AuthGuard('local')) //@UseGuards(LocalStrategy)
    @Post('login')
    async login(@Req() req){
        //console.log(req.user);
        return this.authService.login(req.user);
    }

    @UseGuards(AuthGuard('jwt'))//@UseGuards(JwtStrategy)
    @Post('test')
    getProfile(@Req() req, @UserDeco() user) { 
        console.log(user);

        //console.log("h : " + user.email);
        //return (req.email);
    }
    
    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleAuth(@Req() req){
    
    }

    @Get('google/test')
    @UseGuards(AuthGuard('google'))
    googleAuthTest(@Req() req){
        console.log("hello");
        console.log(req.user);
        return this.authService.login(req.user);
    }

    @Get('42')
    @UseGuards(AuthGuard('42'))
    fortytwoAuth(@Req() req){

    }
    @Get('42/test')
    @UseGuards(AuthGuard('42'))
    fortytwoAuthTest(@Req() req){
        return "Hi 42";
    }

    */
}