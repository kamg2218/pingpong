import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserRepository } from 'src/db/repository/User/UserCustomRepository';
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
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { ChatGatewayService } from './chatGateway.service';
import { CORS_ORIGIN } from 'src/config/const';

const options = {
    cors : {
        origin : CORS_ORIGIN,
        credentials : true,
    }
}

@WebSocketGateway(options)
export class AuthGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
	constructor(
		private readonly logger : Logger,
		private readonly jwtService : JwtService,
		private readonly authService : AuthService,
		private readonly userGatewayService : UserGatewayService,
		private readonly gameGatewayService : GameGatewayService,
		private readonly chatGatewayService : ChatGatewayService) {  
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

	private getAccessToken(raw : string) {
		const words = raw.split("; ");
		for (let index in words) {
			let word = words[index];
			if (word.search("accessToken=") !== -1) {
				let name = "accessToken=";
				let value = word.slice(name.length);
				return value;
			}
		}
		throw new Error("No Token");
	}

	async handleConnection(@ConnectedSocket() socket: AuthSocket) {
    	this.logger.log(`${socket.id} socket connected`, "AuthGateway");
		const x = socket?.handshake?.headers["authorization"];
		if (process.env.NODE_ENV === "dev") {
			return ;
		}
		if (!x)
			socket.disconnect();
		else {
			try {
				let tokenValue = this.getAccessToken(x);
				let inform = true;
				console.log(`verify : ${tokenValue}`);
				let res = await this.jwtService.verify(tokenValue);
				let user = await this.authService.validateJwt(res);
				socket['userid'] = res.userid;
				if (onlineManager.isOnline(res.userid))
					inform = false;
				onlineManager.online(socket);
				onlineManager.print();
				socket.historyIndex = 0;
				if (!inform)
					return ;
				// const repo_user = getCustomRepository(UserRepository);
				// const list = await onlineManager.onlineFriends(socket, user);
				// this.chatGatewayService.onlineMyChatRoom(socket);
				// for (let sokId in list) {
				// 	let friend = list[sokId]
				// 	const all = Promise.all([
				// 		this.userGatewayService.getUserInfo(friend),
				// 		this.userGatewayService.getFriendsInfo(friend),
				// 		this.userGatewayService.getFriendRequest(friend),
				// 		this.userGatewayService.getGamehistory(friend),
				// 		this.userGatewayService.getBlocklist(friend),
				// 	]);
				// 	all.then((values)=>{
				// 		this.server.to(sokId).emit("userInfo", this.userGatewayService.arrOfObjToObj(values));
				// 	});}
			}
			catch(err) {
				console.log("Invalid Token");
				console.log(err);
				socket.disconnect();
			}
		}
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
		// await getCustomRepository(UserRepository).logout(user);
		// console.log("[disconnected] online game : ", onlineGameMap);
		// const list = await onlineManager.onlineFriends(socket, user);
		// for (let sokId in list) {
		// 	let friend = list[sokId];
		// 	const all = await Promise.all([
		// 		this.userGatewayService.getUserInfo(friend),
		// 		this.userGatewayService.getFriendsInfo(friend),
		// 		this.userGatewayService.getFriendRequest(friend),
		// 		this.userGatewayService.getGamehistory(friend),
		// 		this.userGatewayService.getBlocklist(friend),
		// 	  ]);
		// 	this.server.to(sokId).emit("userInfo", this.userGatewayService.arrOfObjToObj(all));
		// }
		await this.chatGatewayService.offlineMyChatRoom(socket);
		onlineManager.offline(socket);
		onlineManager.print();
		// let gameRoom = await this.gameGatewayService.getMyGameRoomList(user);
		// if (gameRoom)
			// gameRoom = await this.gameGatewayService.exitGameRoom(socket, user, gameRoom.roomid);
	}

	@SubscribeMessage('connecting')
	async saveSocket(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload : any) {
		const user = await getCustomRepository(UserRepository).findOne({nickname : payload.myNickname})
		socket.userid = user.userid;
		onlineManager.online(socket);
		onlineManager.print();
		const list = await onlineManager.onlineFriends(socket, user);
		for (let sokId in list) {
			let friend = list[sokId];
			const all = await Promise.all([
				this.userGatewayService.getUserInfo(friend),
				this.userGatewayService.getFriendsInfo(friend),
				this.userGatewayService.getFriendRequest(friend),
				this.userGatewayService.getGamehistory(friend),
				this.userGatewayService.getBlocklist(friend),
			  ]);
			this.server.to(sokId).emit("userInfo", this.userGatewayService.arrOfObjToObj(all));
		}
		this.chatGatewayService.onlineMyChatRoom(socket);
	}
}
