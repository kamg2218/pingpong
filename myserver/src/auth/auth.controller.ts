import { Controller, UseGuards, Post, Query, Get, Body, Headers, Delete} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserDeco } from './user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JWT_PAYLOAD } from 'src/Type/Payload.type';
import { CreateUserDTO } from 'src/Type/create-user.dto';


@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService : AuthService){ }
    
    @Post('signup')
    signup(@Body() userData : CreateUserDTO){
        console.log("SIGNUP");
        return this.authService.createUser(userData);
    }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    login(@UserDeco() user_id : string){
        console.log("LOGIN");
        return this.authService.login(user_id);
    }

    @Get('check')
    async isDuplicate(@Query() {email, nickname} ){
        console.log("DUPLOCATE");
        if (email)
            return await this.authService.isDuplicateEmail(email);
        else if (nickname)
            return await this.authService.isDuplicateNickname(nickname);
    }

    @UseGuards(JwtAuthGuard)
    @Get('logout')
    logout(@Headers('access_token') at : string){
        console.log("LOGOUT")
        return this.authService.logout(at);
    }

    @UseGuards(JwtAuthGuard)
    @Post('issue')
    issueAT(@Headers('access_token') at : string ){ 
        console.log("ISSUE");
        return this.authService.issueAT(at);
    }
    
    @UseGuards(JwtAuthGuard)
    @Delete('withdrawal')
    withdrawal(@UserDeco() user : JWT_PAYLOAD, @Body() userData : CreateUserDTO){
        return this.authService.deleteUser(user, userData);
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