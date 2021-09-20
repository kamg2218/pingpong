import { Body, Controller, Get, Post, Query, HttpCode} from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('api/account')
export class AccountController {
    constructor(private accountService : AccountService) {
    }

    @Post('/signup')
    create(@Body('email') email : string, @Body('password') password : string, @Body('nickname') nickname : string){
        return this.accountService.create(email, nickname, password);
    }

    @Post('/signin')
    @HttpCode(200)
    signIn(@Body('email') email : string, @Body('password') password : string){
        return this.accountService.signIn(email, password);
    }

    @Get('/check')
    isDuplicate(@Query() x : string ,@Query('email') email : string, @Query('nickname') nickname:string){
        //console.log("email : " + x['email'] + ", nick : " + x['nickname']);
        let result : Promise<boolean>;
        if (email)
            result = this.accountService.isDuplicateEmail(email);
        else if (nickname)
            result = this.accountService.isDuplicateNickname(nickname);
        return (result);
    }
}
