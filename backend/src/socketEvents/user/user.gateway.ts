import { Logger, UseGuards} from "@nestjs/common";
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
import { Emitter } from '../auth/emitter';

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
	private readonly emitter = new Emitter(this);

    afterInit(server: Server) : any {
      this.logger.log('UserGateway init');
    }
  
    private log(msg : any) {
      	this.logger.log(msg, "UserGateway");
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
			this.emitter.emit(socket, "userInfo", this.userGatewayService.arrOfObjToObj(all));
    }

    @SubscribeMessage('opponentProfile')
    async sendOpponentInfo(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UserInfoDTO) {
			this.log({gate : "opponentProfile", ...payload});
			const theOther = await getCustomRepository(UserRepository).findOne(payload.userid);
			if (!theOther) {
				this.log("No such user");
				return ;
			}
			const user = await getCustomRepository(UserRepository).findOne(socket.userid);
			const all = await Promise.all([
				this.userGatewayService.getTheOtherUSerInfo(user, theOther),
				this.userGatewayService.getGamehistory(theOther)
			]);
			this.emitter.emit(socket, "opponentProfile", this.userGatewayService.arrOfObjToObj(all));
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
			this.emitter.emitById(sok_friend, "newFriend", repo_user.getSimpleInfo(user))
	}

    @SubscribeMessage('deleteFriend')
    async deleteFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UserInfoDTO) {
			this.log({gate : "deleteFriend", ...payload});
			const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			const friend = await this.userGatewayService.checkValidateDeleteFriend(user, payload.userid);
			if (!friend)
				return ;
			await this.userGatewayService.deleteFriend(user, friend);
			const friendScoketID = onlineManager.socketIdOf(friend.userid);
			this.emitter.emit(socket, "deleteFriend", {userid : friend.userid});
			if (friendScoketID)
				this.emitter.emitById(friendScoketID, "deleteFriend", {userid : user.userid});
    }

    @SubscribeMessage('blockFriend')
    async blockFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UserInfoDTO) {
			this.log({gate : "blockFriend", ...payload});
			const repo_user = getCustomRepository(UserRepository);
			const user = await repo_user.findOne(onlineManager.userIdOf(socket.id));
			const theOther = await this.userGatewayService.checkValidateBlockFriend(user, payload.userid);
			if (!theOther)
				return ;
			await this.userGatewayService.block(user, theOther);
			const theOtherScoketID = onlineManager.socketIdOf(theOther.userid);
			this.emitter.emit(socket, "blockFriend", repo_user.getSimpleInfo(theOther));
			if (theOtherScoketID)
				this.emitter.emitById(theOtherScoketID, "deleteFriend", {userid : user.userid});
    }

    @SubscribeMessage('unblockFriend')
    async unblockFriend(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UserInfoDTO) {
			this.log({gate : "unblockFriend", ...payload});
			const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			const theOther = await this.userGatewayService.checkValidateUnblockFriend(user, payload.userid);
			await this.userGatewayService.unblock(user, theOther);
    }

    @SubscribeMessage('newFriend')
    async respondToFriendRequest(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : NewFriendDTO) {
			this.log({gate : "newFriend", ...payload});
			const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			const {isAccepted, theOtherInfo, myInfo} = await this.userGatewayService.resepondToFriendRequest(user, payload.userid, payload.result);
			if (isAccepted) {
				const sok_friend = onlineManager.socketIdOf(payload.userid);
				this.emitter.emit(socket, 'addFriend', theOtherInfo);
				this.emitter.emitById(sok_friend, "addFriend", myInfo);
			}
    }

    @SubscribeMessage('updateProfile')
    async update(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : UpdateProfileDTO) {
			this.log({gate : "updateProfile", ...payload});
			const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
			const updateResult = await this.userGatewayService.update(user, payload);
			this.emitter.emit(socket, "updateProfile", {...updateResult});
	}
}