import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserRepository } from 'src/db/repository/User/UserCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { getConnection, getCustomRepository } from 'typeorm';
import { onlineManager } from '../online/onlineManager';
import { instrument } from '@socket.io/admin-ui';
import { GameGatewayService } from '../game/gameGateway.service';
import { onlineGameMap } from '../online/onlineGameMap';
import { User } from 'src/db/entity/User/UserEntity';
import { Game } from 'src/socketEvents/game/gameElement/game';
import { ormconfig } from 'src/config/ormconfig';
import { MatchingManager } from '../online/matchingManager';
import { UserGatewayService } from '../user/userGateway.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { ChatGatewayService } from '../chat/chatGateway.service';
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
		if (!x) {
			console.log("No Authorization header");
			socket.disconnect();
		}
		else {
			try {
				let tokenValue = this.getAccessToken(x);
				let res = await this.jwtService.verify(tokenValue);
				let user = await this.authService.validateJwt(res);
				if (!user) {
					throw new UnauthorizedException("no such user");
				}
				socket['userid'] = res.userid;
				onlineManager.online(socket);
				onlineManager.print();
				socket.historyIndex = 0;
				await this.chatGatewayService.onlineMyChatRoom(socket);
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
				socket.disconnect();
			}
		}
  	}

	async handleDisconnect(@ConnectedSocket() socket: AuthSocket) {
		console.log("[auth], ", new Date());
		this.logger.log(`${socket.id} socket disconnected`, "AuthGateway");
		const userid = onlineManager.userIdOf(socket.id);
		console.log("[auth2], ", new Date());
		const user = await getCustomRepository(UserRepository).findOne(userid);
		console.log("[auth3], ", new Date());
		if (!user)
			return ; //test
		/* ----- */
		/* game : Exit game room*/
		console.log("[auth4], ", new Date());
		MatchingManager.cancle(userid);
		await this.gameGatewayService.deleteMyMatch(user.userid);
		console.log("[auth5], ", new Date());
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
		console.log("[auth6], ", new Date());
		onlineManager.offline(socket);
		console.log("[auth7], ", new Date());
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
