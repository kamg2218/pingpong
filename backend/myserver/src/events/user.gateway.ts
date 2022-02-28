
import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException, WsResponse } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CORS_ORIGIN } from 'src/config/const';
import { User } from 'src/db/entity/User/UserEntity';
import { UserRepository } from 'src/db/repository/User/UserCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { getCustomRepository } from 'typeorm';
import { onlineManager } from './online/onlineManager';
import { UserGatewayService } from './userGateway.service';

const options = {
    cors : {
        origin : CORS_ORIGIN,
        credentials : true,
    }
}
@WebSocketGateway(options)
// @UseGuards(AuthGuard('ws-jwt'))
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

	private over(gateway : string) {
        console.log(`[${gateway} is over]---------\n`)
    }

    @SubscribeMessage('userInfo') 
    async sendUserInfo(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		this.log({gate : "userInfo", ...payload1});
		let user : User;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        }
		const all = await Promise.all([
			this.userGatewayService.getUserInfo(user),
			this.userGatewayService.getFriendsInfo(user),
			this.userGatewayService.getFriendRequest(user),
			this.userGatewayService.getGamehistory(user),
			this.userGatewayService.getBlocklist(user),
		]);
		socket.emit("userInfo", this.userGatewayService.arrOfObjToObj(all));
		return this.over("userInfo");
    }

    @SubscribeMessage('opponentProfile')
    async sendOpponentInfo(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		this.log({gate : "opponentProfile", ...payload1});
		let user : User;
		let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
			const theOtherX = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname});
			payload = {userid : theOtherX.userid};
		}
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			payload = payload1
		}
		if (!payload.userid) {
			this.log("Bad Request")
			return this.over("opponentProfile");
		}
		const theOther = await getCustomRepository(UserRepository).findOne(payload.userid);
		const all = await Promise.all([
			this.userGatewayService.getTheOtherUSerInfo(user, theOther),
			this.userGatewayService.getGamehistory(theOther)
		]);
		socket.emit("opponentProfile", this.userGatewayService.arrOfObjToObj(all));
		return this.over("opponentProfile");
    }

    @SubscribeMessage('addFriend')
    async requestFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		this.log({gate : "addFriend", ...payload1});
		let user : User;
		let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
			const theOtherX = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname});
			payload = {userid : theOtherX.userid};
		}
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			payload = payload1
		}
		if (!payload?.userid) {
			this.log("Bad Request : No such user");
			// throw new WsException("Bad Request");
			return this.over("addFriend");
		}
		await this.userGatewayService.sendFriendRequest(user, payload.userid);
		const sok_friend = onlineManager.socketIdOf(payload.userid);
		this.server.to(sok_friend).emit("addFriend", {userid : user.userid, nickname : user.nickname, profile : user.profile });
		return this.over("addFriend");
	}

    @SubscribeMessage('deleteFriend')
    async deleteFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		this.log({gate : "deleteFriend", ...payload1});
		let user : User;
		let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
			const theOtherX = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname});
			payload = {userid : theOtherX.userid};
		}
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			payload = payload1
		}
		if (!payload.userid) {
			this.log("Bad Request : no such user");
			return this.over("deleteFriend");
		}
		await this.userGatewayService.deleteFriend(user, payload.userid);
		return this.over("deleteFriend");
    }

    @SubscribeMessage('block')
    async blockFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		this.log({gate : "block", ...payload1});
		let user : User;
		let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
			const theOtherX = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname});
			payload = {userid : theOtherX.userid};
		}
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			payload = payload1
		}
		if (!payload.userid) {
			this.log("Bad Request : no such user");
			return this.over("block");
		}
		await this.userGatewayService.block(user, payload.userid);
		return this.over("block");
    }

    @SubscribeMessage('unblock')
    async unblockFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		this.log({gate : "unblock", ...payload1});
		let user : User;
		let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
			const theOtherX = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname});
			payload = {userid : theOtherX.userid};
		}
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			payload = payload1
		}
		if (!payload.userid) {
			this.log("Bad Request : no such user");
			return this.over("unblock");
		}
		await this.userGatewayService.unblock(user, payload.userid);
		return this.over("unblock");
    }

    @SubscribeMessage('newFriend')
    async respondToFriendRequest(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		this.log({gate : "newFriend", ...payload1});
		let user : User;
		let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
			const theOtherX = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname});
			payload = {userid : theOtherX.userid, respond : payload1.respond};
		}
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			payload = payload1
		}
		if (!payload.userid) {
			this.log("Bad Request : No such user")
			return this.over("newFriend");
		}
		const {isAccepted, theOtherInfo, myInfo} = await this.userGatewayService.resepondToFriendRequest(user, payload.userid, payload.respond);
		if (isAccepted) {
			const sok_friend = onlineManager.socketIdOf(payload.userid);
			socket.emit('newFriend', theOtherInfo);
			this.server.to(sok_friend).emit("newFriend", myInfo);
		}
		return this.over("newFriend");
    }

    @SubscribeMessage('updateProfile')
    async update(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		this.log({gate : "updateProfile", ...payload1});
		let user : User;
		let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
			const theOtherX = await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname});
			payload = {nickname : payload1?.nickname, profile : payload1?.profile};
		}
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			payload = payload1
		}
		this.server.to(socket.id).emit("updateProfile", {data : await this.userGatewayService.update(user, payload)});
		return this.over("updateProfile");
	}
}