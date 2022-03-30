
import { Logger, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserRepository } from 'src/db/repository/User/UserCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { getCustomRepository } from 'typeorm';
import { onlineManager } from '../online/onlineManager';
import { UserGatewayService } from './userGateway.service';
import { UserInfoDTO, NewFriendDTO, UpdateProfileDTO } from './dto/user.dto';
import { WsGuard } from '../ws.guard';
import { CORS_ORIGIN } from 'src/config/url';

const options = {
  cors : {
    origin : CORS_ORIGIN,
    credentials : true,
  }
}
@WebSocketGateway(options)
@UseGuards(WsGuard)
export class UserGateway{
  
    constructor(
    	private readonly logger : Logger,
    	private readonly userGatewayService : UserGatewayService) {
    }

    @WebSocketServer() public server:Server;
  
    afterInit(server: Server) : any {
      this.logger.log('UserGateway init');
    }
  
    private log(msg : any) {
      	this.logger.log(msg, "UserGateway");
  	}

		private over(gateway : string) {
      // console.log(`[${gateway} is over]---------\n`)
    }

    @SubscribeMessage('userInfo') 
    async sendUserInfo(@ConnectedSocket() socket : AuthSocket) {
			this.log({gate : "userInfo"});
			
			if (!socket.userid)
				return ;
			const user = await getCustomRepository(UserRepository).findOne(socket.userid);
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
    async sendOpponentInfo(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UserInfoDTO) {
			this.log({gate : "opponentProfile", ...payload});
			const theOther = await getCustomRepository(UserRepository).findOne(payload.userid);
			if (!theOther) {
				this.log("No such user");
				return ;
			}
			if (!socket.userid)
				return ;
			const user = await getCustomRepository(UserRepository).findOne(socket.userid);
			const all = await Promise.all([
				this.userGatewayService.getTheOtherUSerInfo(user, theOther),
				this.userGatewayService.getGamehistory(theOther)
			]);
			socket.emit("opponentProfile", this.userGatewayService.arrOfObjToObj(all));
			return this.over("opponentProfile");
    }

    @SubscribeMessage('addFriend')
    async requestFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UserInfoDTO) {
			this.log({gate : "addFriend", ...payload});
			const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			const repo_user = getCustomRepository(UserRepository);
			if (! await this.userGatewayService.checkIfICanSendFriendRequest(user, payload.userid)) {
				this.log("Bad Request");
				return ;
			}
			await this.userGatewayService.sendFriendRequest(user, payload.userid);
			const sok_friend = onlineManager.socketIdOf(payload.userid);
			this.server.to(sok_friend).emit("addFriend", repo_user.getSimpleInfo(user));
			return this.over("addFriend");
	}

    @SubscribeMessage('deleteFriend')
    async deleteFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UserInfoDTO) {
			this.log({gate : "deleteFriend", ...payload});
			const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			await this.userGatewayService.deleteFriend(user, payload.userid);
			return this.over("deleteFriend");
    }

    @SubscribeMessage('blockFriend')
    async blockFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UserInfoDTO) {
			this.log({gate : "blockFriend", ...payload});
			const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			await this.userGatewayService.block(user, payload.userid);
			return this.over("blockFriend");
    }

    @SubscribeMessage('unblockFriend')
    async unblockFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UserInfoDTO) {
			this.log({gate : "unblockFriend", ...payload});
			const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			await this.userGatewayService.unblock(user, payload.userid);
			return this.over("unblockFriend");
    }

    @SubscribeMessage('newFriend')
    async respondToFriendRequest(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : NewFriendDTO) {
			this.log({gate : "newFriend", ...payload});
			const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			const {isAccepted, theOtherInfo, myInfo} = await this.userGatewayService.resepondToFriendRequest(user, payload.userid, payload.result);
			if (isAccepted) {
				const sok_friend = onlineManager.socketIdOf(payload.userid);
				socket.emit('newFriend', theOtherInfo);
				this.server.to(sok_friend).emit("newFriend", myInfo);
			}
			return this.over("newFriend");
    }

    @SubscribeMessage('updateProfile')
    async update(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UpdateProfileDTO) {
			this.log({gate : "updateProfile", ...payload});
			const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			const updateResult = await this.userGatewayService.update(user, payload)
			this.server.to(socket.id).emit("updateProfile", {...updateResult});
			return this.over("updateProfile");
	}
}