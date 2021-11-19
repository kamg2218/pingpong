import { Body, Controller, Get, Redirect, Res, UseFilters, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/db/entity/User/UserEntity';
import { AuthGuard } from '@nestjs/passport'
import { UserDeco } from './user.decorator';
import { lobyPage } from 'src/config/redirect_url';
import { NotFoundUserFillter } from 'src/filter/NotFoundUserFillter';
import { Response } from 'express'
import { SignUpDTO } from 'src/type/signup.dto';

@UseFilters(new NotFoundUserFillter())
@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService){}

    @Get('signup')
    @UseGuards(AuthGuard('custom'))
    @Redirect('http://localhost:4242/auth/login')
    async signup(@UserDeco() email : string, @Body() data : SignUpDTO) {
        // const email1 = "jikwon@student.42seoul.kr"
        // const data1 =  { nickname : "jikwon", profile : "/image"}
        this.authService.createUser(email, data)
        return true;
    }
    
    @Get('login')
    @UseGuards(AuthGuard('42'))
    async login( @Res({passthrough : true}) res : Response , @UserDeco() user: User) {
        const tokens = await this.authService.login(user);
        res.cookie('refreshToken', tokens.refreshToken, {maxAge : tokens.rtExpireIn})
        res.cookie('accessToken', tokens.accessToken, {maxAge : tokens.atExpireIn})
        return res.redirect(lobyPage);
    }

    @Get('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@UserDeco() user : User) {
        this.authService.logout(user);
    }
    
/*
    async temp(userid : string, chatid : string){
        // const user = await getRepository(User).findOne(userid);
        // const repo_chatroom = getCustomRepository(ChatRoomRepository);
        // repo_chatroom.exitRoomById(user, chatid);
        console.log(new Date());
    }

    @Post('chat/create')
    async createChatRoom(@Body('userid') userid : string, @Body('title') title : string){
        console.log("CREATE CHAT ROOM")
        const user = await getRepository(User).findOne(userid);
        const mode = "private"
        const repo_room = getCustomRepository(ChatRoomRepository)
        const new_room = await repo_room.createRoom(title, mode);
        repo_room.enterRoom(user, new_room);
        // setTimeout(this.temp, 1000, userid, new_room.chatid)
        console.log(new Date());
        // setInterval(()=>{this.temp(userid, new_room.chatid)}, 3000)
        return new_room.chatid;
        
}
    //이미 존재하는 채팅방에 접속.
    @Get('chat/enter')
    async enterChatRoom(@Body('userid') userid : string, @Param('chatid') chatid : string) {
        // user가 이미 채팅방에 있는 경우 확인필요.
        // user가 ban list에 있는지 확인필요.
        // private 한 채널에 초대가 되어진건지 확인필요.
        const repo_chatroom = await getCustomRepository(ChatRoomRepository);
        const user = await getRepository(User).findOne(userid);
        const chatroom = await repo_chatroom.findOne(chatid);
        if (chatroom)
            repo_chatroom.enterRoom(user, chatroom);
        return chatid;  
    }

    @Delete('chat/exit')
    async exitChatRoom(@Body('userid') userid : string, @Body('chatid') chatid : string ) {
        // chatid 인 채팅방이 없을 경우 확인필요.
        // chat방 최대인원수 확인필요.
        const user = await getRepository(User).findOne(userid);
        const repo_chatroom = getCustomRepository(ChatRoomRepository);
        repo_chatroom.exitRoomById(user, chatid);
    }
    
    @Delete('delete')
    async deleteUser(@Body('userid') userid : string) {
        const repo_user = getRepository(User);
        const user = await repo_user.findOne(userid);
        if (user)
            await repo_user.remove(user)
   }

   */
}