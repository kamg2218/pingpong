import { Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserRepository } from 'src/db/repository/User/User.repository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { getConnection, getCustomRepository } from 'typeorm';
import { onlineManager } from './online/onlineManager';
import { instrument } from '@socket.io/admin-ui';
import { GameGatewayService } from './gameGateway.service';
import { onlineGameMap } from './online/onlineGameMap';
import { User } from 'src/db/entity/User/UserEntity';
import { Game } from 'src/events/gameElement/game';
import { ormconfig } from 'src/config/ormconfig';
import { MatchingManager } from './online/matchingManager';
import { UserGatewayService } from './userGateway.service';

const options = {
	cors : {
    	origin : ["http://localhost:3000", "https://admin.socket.io"],
    	credentials : true,
  }
}


@WebSocketGateway(options)
// @UseGuards(AuthGuard('ws-jwt'))
export class AuthGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
	constructor(
		private readonly logger : Logger,
		private readonly userGatewayService : UserGatewayService,
		private readonly gameGatewayService : GameGatewayService) {  
	}
  
	@WebSocketServer() public server:Server;

	async afterInit(server: Server)  {
		this.logger.log('AuthGateway init', "AuthGateway");
		Game.init(this.server);
		instrument(server, {
		auth : false
		});

		/**/
		if (process.env.NODE_ENV === "dev" && ormconfig.dropSchema) {
			const connection = getConnection();
			await connection
				.createQueryBuilder()
				.insert()
				.into(User)
				.values([
				{email : "jikwon@student.42seoul.kr", nickname : "jikwon", status : "logout", profile : 1},
				{email : "nahkim@student.42seoul.kr", nickname : "nahkim", status : "logout", profile : 2},
				{email : "hyoon@student.42seoul.kr", nickname : "hyoon", status : "logout", profile : 3},
				{email : "hyeyoo@student.42seoul.kr", nickname : "hyeyoo", status : "logout", profile : 4},
				{email : "dong@student.42seoul.kr", nickname : "dong", status : "logout", profile : 5},
				{email : "pangpang@student.42seoul.kr", nickname : "pangpang", status : "logout", profile : 6},
				{email : "cat@student.42seoul.kr", nickname : "cat", status : "logout", profile : 7},
				{email : "dog@student.42seoul.kr", nickname : "dog", status : "logout", profile : 8},
				])
				.execute();
		}
	}

	handleConnection(@ConnectedSocket() socket: AuthSocket) : any {
    	this.logger.log(`${socket.id} socket connected`, "AuthGateway");
  	}

	async handleDisconnect(@ConnectedSocket() socket: AuthSocket) {
		this.logger.log(`${socket.id} socket disconnected`, "AuthGateway");
		const userid = onlineManager.userIdOf(socket.id);
		const user = await getCustomRepository(UserRepository).findOne(userid);
		if (!user)
			return ; //test
		/* ----- */
		/* game : Exit game room*/
		MatchingManager.cancle(userid);
		await this.gameGatewayService.deleteMyMatch(user.userid);
		let gameRoom = await this.gameGatewayService.getMyGameRoomList(user);
		if (gameRoom) {
		gameRoom = await this.gameGatewayService.exitGameRoom(socket, user, gameRoom.roomid);
		}
		onlineManager.offline(socket);
		onlineManager.print();
		console.log("[disconnected] online game : ", onlineGameMap);
		const list = await onlineManager.onlineFriends(socket, user);
		for (let sokId in list) {
			let friend = list[sokId];
			const all = Promise.all([
				this.userGatewayService.getUserInfo(friend),
				this.userGatewayService.getFriendsInfo(friend),
				this.userGatewayService.getFriendRequest(friend),
				this.userGatewayService.getGamehistory(friend),
				this.userGatewayService.getBlocklist(friend),
			  ]);
			all.then((values)=>{
				this.server.to(sokId).emit("userInfo", this.userGatewayService.arrOfObjToObj(values));
			});
		}
	}

	@SubscribeMessage('connecting')
	async saveSocket(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload : any) {
		await onlineManager.online(socket, payload);
		onlineManager.print();
		const repo_user = getCustomRepository(UserRepository);
        const user = await repo_user.findOne({nickname : payload.myNickname}); //temp
		const list = await onlineManager.onlineFriends(socket, user);
		for (let sokId in list) {
			let friend = list[sokId];
			const all = Promise.all([
				this.userGatewayService.getUserInfo(friend),
				this.userGatewayService.getFriendsInfo(friend),
				this.userGatewayService.getFriendRequest(friend),
				this.userGatewayService.getGamehistory(friend),
				this.userGatewayService.getBlocklist(friend),
			  ]);
			all.then((values)=>{
				this.server.to(sokId).emit("userInfo", this.userGatewayService.arrOfObjToObj(values));
			});
		}
	}
}
