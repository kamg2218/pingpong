
import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException, WsResponse } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserRepository } from 'src/db/repository/User/UserCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { getCustomRepository } from 'typeorm';
import { onlineManager } from './online/onlineManager';
// import { onlineMap } from './online/onlineManager';
import { UserGatewayService } from './userGateway.service';

const options = {
  cors : {
    origin : ["http://localhost:3000", "https://admin.socket.io"],
    credentials : true,
    // origin : "http://localhost:3000",
  }
}

@WebSocketGateway(options)
// @UseGuards(AuthGuard('jwt'))
export class UserGateway{
  
    constructor(
      	private readonly logger : Logger,
      	private readonly userGatewayService : UserGatewayService) {
    }

    @WebSocketServer() public server:Server;
  
    afterInit(server: Server) : any {
      	this.logger.log('UserGateway init');
    }
  
    private log(msg : String) {
      	this.logger.log(msg, "UserGateway");
  }

    @SubscribeMessage('userInfo') 
    async sendUserInfo(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
		/* temp */
		/* change : user = onlinemap[socket.nsp.name][socket.id] */
		/* ? or userid = onlineMap[socket.nsp.name][socket.id]; */
		const user = await getCustomRepository(UserRepository).findOne({nickname : payload.myNickname});
		/* ------- */
		const all = Promise.all([
			this.userGatewayService.getUserInfo(user),
			this.userGatewayService.getFriendsInfo(user),
			this.userGatewayService.getFriendRequest(user),
			this.userGatewayService.getGamehistory(user),
			this.userGatewayService.getBlocklist(user),
		]);
		all.then((values)=>{
			socket.emit("userInfo", this.userGatewayService.arrOfObjToObj(values));
		});
    }

    @SubscribeMessage('opponentProfile')
    async sendOpponentInfo(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		/* temp */
		/* change : user = onlinemap[socket.nsp.name][socket.id] */
		const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
		const theOther = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname});
		const payload = {userid : theOther.userid};
		/* ------- */
		const all = Promise.all([
			this.userGatewayService.getTheOtherUSerInfo(user, theOther),
			this.userGatewayService.getGamehistory(theOther)
		]);
		all.then((values)=>{
			socket.emit("opponentProfile", this.userGatewayService.arrOfObjToObj(values));
		})
    }

    @SubscribeMessage('addFriend')
    async requestFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		/* temp */
		/* change : user = onlinemap[socket.nsp.name][socket.id] */
		const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
		const payload = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname});
		/* ------- */
		if (!payload?.userid) {
			this.log("No such user");
			throw new WsException("Bad Request");
		}
		await this.userGatewayService.sendFriendRequest(user, payload.userid);
		const sok_friend = onlineManager.socketIdOf(payload.userid);
		this.server.to(sok_friend).emit("addFriend", {userid : user.userid, nickname : user.nickname, profile : user.profile });
    }

    @SubscribeMessage('deleteFriend')
    async deleteFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		/* temp */
		/* change : user = onlinemap[socket.nsp.name][socket.id] */
		const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
		const payload = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname})
		/* ------- */
		if (!payload.userid)
			throw new WsException("Bad Request");
		await this.userGatewayService.deleteFriend(user, payload.userid);
    }

    @SubscribeMessage('block')
    async blockFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		/* temp */
		/* change : user = onlinemap[socket.nsp.name][socket.id] */
		const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
		const payload = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname})
		/* ------- */
		if (!payload.userid)
			throw new WsException("Bad Request");
		await this.userGatewayService.block(user, payload.userid);
    }

    @SubscribeMessage('unblock')
    async unblockFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		/* temp */
		/* change : user = onlinemap[socket.nsp.name][socket.id] */
		const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
		const payload = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname})
		/* ------- */
		if (!payload.userid)
			throw new WsException("Bad Request");
		await this.userGatewayService.unblock(user, payload.userid);
    }

    // "theOtherNickname" : "jikwon"
    // "respond" : false
    @SubscribeMessage('newFriend')
    async respondToFriendRequest(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		// userid, respond 필수
		/* temp */
		/* change : user = onlinemap[socket.nsp.name][socket.id] */
		const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
		const x = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname});
		const payload = {userid : x?.userid, respond : payload1.respond};
		/* ------- */
		if (!payload.userid) {
			this.log("No such user")
			throw new WsException("No such user");
		}
		const {isAccepted, theOtherInfo, myInfo} = await this.userGatewayService.resepondToFriendRequest(user, payload.userid, payload.respond);
		if (isAccepted) {
			const sok_friend = onlineManager.socketIdOf(payload.userid);
			socket.emit('newFriend', theOtherInfo);
			this.server.to(sok_friend).emit("newFriend", myInfo);
		}
    }

    @SubscribeMessage('updateProfile')
    async update(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) : Promise<WsResponse<object>> {
		/* temp */
		/* change : user = onlinemap[socket.nsp.name][socket.id] */
		const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
		const payload = {nickname : payload1?.nickname, profile : payload1?.profile};
		/* ------- */
		return { 
			event : "updateProfile", 
			data : await this.userGatewayService.update(user, payload)
		};
	}
}