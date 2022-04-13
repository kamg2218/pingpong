import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserRepository } from 'src/db/repository/User/UserCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { getConnection, getCustomRepository } from 'typeorm';
import { onlineManager } from '../online/onlineManager';
import { instrument } from '@socket.io/admin-ui';
import { GameGatewayService } from '../game/gameGateway.service';
import { Friends, User } from 'src/db/entity/User/UserEntity';
import { Game } from 'src/socketEvents/game/gameElement/game';
import { ormconfig } from 'src/config/ormconfig';
import { MatchingManager } from '../online/matchingManager';
import { UserGatewayService } from '../user/userGateway.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { ChatGatewayService } from '../chat/chatGateway.service';
import { WsGuard } from '../ws.guard';
import { CORS_ORIGIN } from 'src/config/url';

const options = {
    cors : {
        origin : ["https://admin.socket.io"],
        credentials : true,
    }
}

@WebSocketGateway(options)
@UseGuards(WsGuard)
export class AuthGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
	constructor(
		private readonly logger : Logger,
		private readonly jwtService : JwtService,
		private readonly authService : AuthService,
		private readonly gameGatewayService : GameGatewayService,
		private readonly chatGatewayService : ChatGatewayService) {  
	}
  
	@WebSocketServer() public server:Server;

	async afterInit(server: Server)  {
		this.logger.log('AuthGateway init', "AuthGateway");
		
		instrument(server, {
		auth : false,
		namespaceName: "/socket.io"
		});

		/**/
		// if (process.env.NODE_ENV === "dev" && ormconfig.dropSchema) {
		if (ormconfig.dropSchema) {
			const connection = getConnection();
			await connection
				.createQueryBuilder()
				.insert()
				.into(User)
				.values([
				{email : "jikwon@student.42seoul.kr", userid : "jikwon", nickname : "jikwon", status : "logout", profile : 1},
				{email : "nahkim@student.42seoul.kr", userid : "nahkim", nickname : "nahkim", status : "logout", profile : 2},
				{email : "hyoon@student.42seoul.kr", userid : "hyoon", nickname : "hyoon", status : "logout", profile : 3},
				{email : "hyeyoo@student.42seoul.kr", userid : "hyeyoo", nickname : "hyeyoo", status : "logout", profile : 2},
				{email : "dong@student.42seoul.kr", userid : "dong", nickname : "dong", status : "logout", profile : 2},
				{email : "pangpang@student.42seoul.kr", userid : "pangpang", nickname : "pangpang", status : "logout", profile : 1},
				{email : "cat@student.42seoul.kr", userid : "cat", nickname : "cat", status : "logout", profile : 3},
				{email : "dog@student.42seoul.kr", userid : "dog", nickname : "dog", status : "logout", profile : 4},
				])
				.execute();
			const jikwon = await getCustomRepository(UserRepository).findOne({nickname : "jikwon"});
			const nahkim = await getCustomRepository(UserRepository).findOne({nickname : "nahkim"});
			await connection
				.createQueryBuilder()
				.insert()
				.into(Friends)
				.values([
					{requestStatus : "friend", requestFrom : jikwon, requestTo : nahkim}
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
		if (!x) {
			console.log("No Authorization header");
			this.logger.log(`${socket.id} socket disconnected - force`, "AuthGateway");
			return ;
			// socket.disconnect();
		}
		else {
			try {
				let tokenValue = this.getAccessToken(x);
				// console.log("token : ", tokenValue);
				let res = await this.jwtService.verify(tokenValue);
				// console.log("res : ", res);
				let user = await this.authService.validate2FAJwt(res);
				if (!user) {
					throw new UnauthorizedException("no such user");
				}
				socket['userid'] = res.userid;
				onlineManager.online(socket);
				onlineManager.print();
				socket.historyIndex = 0;
				this.chatGatewayService.onlineMyChatRoom(socket);
				this.gameGatewayService.onlineMyGameRoom(socket);
			}
			catch(err) {
				console.log("Invalid Token");
				this.logger.log(`${socket.id} socket disconnected - force`, "AuthGateway");
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
		await this.chatGatewayService.offlineMyChatRoom(socket);
		await this.gameGatewayService.offlineMyGameRoom(socket);
		console.log("[auth6], ", new Date());
		onlineManager.offline(socket);
		console.log("[auth7], ", new Date());
		onlineManager.print();
		delete socket.userid;
		// let gameRoom = await this.gameGatewayService.getMyGameRoomList(user);
		// if (gameRoom)
			// gameRoom = await this.gameGatewayService.exitGameRoom(socket, user, gameRoom.roomid);
	}
}
