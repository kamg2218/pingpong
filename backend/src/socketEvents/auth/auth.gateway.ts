import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Friends, User } from 'src/db/entity/User/UserEntity';
import {GameRoom, GameMembership} from 'src/db/entity/Game/GameEntity';
import { UserRepository } from 'src/db/repository/User/UserCustomRepository';
import { GameMembershipRepository, GameRoomRepository } from 'src/db/repository/Game/GameCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { getConnection, getCustomRepository } from 'typeorm';
import { instrument } from '@socket.io/admin-ui';
import { Game } from 'src/socketEvents/game/gameElement/game';
import { ormconfig } from 'src/config/ormconfig';
import { onlineGameMap } from '../online/onlineGameMap';
import { onlineManager } from '../online/onlineManager';
import { MatchingManager } from '../online/matchingManager';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { GameGatewayService } from '../game/gameGateway.service';
import { ChatGatewayService } from '../chat/chatGateway.service';
import { WsGuard } from '../ws.guard';
import { CORS_ORIGIN } from 'src/config/url';
// import { CHECKER } from './test';


// const checker = new CHECKER();
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

	private async initUserDate() {
		const connection = getConnection();
		await connection
			.createQueryBuilder()
			.insert()
			.into(User)
			.values([
			{email : "jikwon@student.42seoul.kr", userid : "jikwon", nickname : "jikwon", status : "logout", profile : 1},
			{email : "jikwon1@student.42seoul.kr", userid : "jikwon1", nickname : "jikwon1", status : "logout", profile : 1},
			{email : "jikwon2@student.42seoul.kr", userid : "jikwon2", nickname : "jikwon2", status : "logout", profile : 1},
			{email : "jikwon3@student.42seoul.kr", userid : "jikwon3", nickname : "jikwon3", status : "logout", profile : 1},
			{email : "nahkim@student.42seoul.kr", userid : "nahkim", nickname : "nahkim", status : "logout", profile : 2},
			{email : "nahkim1@student.42seoul.kr", userid : "nahkim1", nickname : "nahkim1", status : "logout", profile : 2},
			{email : "nahkim2@student.42seoul.kr", userid : "nahkim2", nickname : "nahkim2", status : "logout", profile : 2},
			{email : "nahkim3@student.42seoul.kr", userid : "nahkim3", nickname : "nahkim3", status : "logout", profile : 2},
			{email : "hyoon@student.42seoul.kr", userid : "hyoon", nickname : "hyoon", status : "logout", profile : 3},
			{email : "hyoon1@student.42seoul.kr", userid : "hyoon1", nickname : "hyoon1", status : "logout", profile : 3},
			{email : "hyoon2@student.42seoul.kr", userid : "hyoon2", nickname : "hyoon2", status : "logout", profile : 3},
			{email : "hyoon3@student.42seoul.kr", userid : "hyoon3", nickname : "hyoon3", status : "logout", profile : 3},
			{email : "hyeyoo@student.42seoul.kr", userid : "hyeyoo", nickname : "hyeyoo", status : "logout", profile : 2},
			{email : "dong@student.42seoul.kr", userid : "dong", nickname : "dong", status : "logout", profile : 2},
			{email : "pangpang@student.42seoul.kr", userid : "pangpang", nickname : "pangpang", status : "logout", profile : 1},
			{email : "cat@student.42seoul.kr", userid : "cat", nickname : "cat", status : "logout", profile : 3},
			{email : "dog@student.42seoul.kr", userid : "dog", nickname : "dog", status : "logout", profile : 4},
			])
			.execute();
	}

	private async initFriend() {
		const connection = getConnection();
		const jikwon = await getCustomRepository(UserRepository).findOne({nickname : "jikwon"});
		const nahkim = await getCustomRepository(UserRepository).findOne({nickname : "nahkim"});
		await connection
			.createQueryBuilder()
			.insert()
			.into(Friends)
			.values([
				{requestStatus : "friend", requestFrom : jikwon, requestTo : nahkim},
			])
			.execute();
	}

	private async initGameRoom() {
		const connection = getConnection();
		const dog = await getCustomRepository(UserRepository).findOne({nickname : "dog"});
		const cat = await getCustomRepository(UserRepository).findOne({nickname : "cat"});
		await connection
		.createQueryBuilder()
		.insert()
		.into(GameRoom)
		.values([
			{title : "[test] dog", type : "public", speed : 1, maxObsCount : 5, owner : dog, roomStatus : "waiting", playerCount : 1, obsCount : 0, createDate : new Date() },
			{title : "[test] cat", type : "public", speed : 1, maxObsCount : 5, owner : cat, roomStatus : "waiting", playerCount : 1, obsCount : 0, createDate : new Date() }
		])
		.execute();

		const dogroom = await getCustomRepository(GameRoomRepository).findOne({title : "[test] dog"});
		const catroom = await getCustomRepository(GameRoomRepository).findOne({title : "[test] cat"});
		await connection
		.createQueryBuilder()
		.insert()
		.into(GameMembership)
		.values([
			{gameRoom : dogroom, member : dog, position : "owner"},
			{gameRoom : catroom, member : cat, position : "owner"},
		])
		.execute();

		const game1 = new Game(dogroom.roomid, dogroom.speed);
		const game2 = new Game(catroom.roomid, catroom.speed);
		onlineGameMap[dogroom.roomid] = game1;
		onlineGameMap[catroom.roomid] = game2;

	}
	async afterInit(server: Server)  {
		this.logger.log('AuthGateway init', "AuthGateway");
		
		instrument(server, {
		auth : false,
		namespaceName: "/socket.io"
		});

		/**/
		if (ormconfig.dropSchema) {
			await this.initUserDate();
			await this.initFriend();
			await this.initGameRoom();
			
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
    	this.logger.log(`${socket.id} socket iis trying to connect`, "AuthGateway");
		const x = socket?.handshake?.headers["authorization"];
		if (!x) {
			this.logger.log(`${socket.id} socket disconnected - force : No Authorization header`, "AuthGateway");
			socket.disconnect();
			return ;
		}
		else {
			try {
				let tokenValue = this.getAccessToken(x);
				let res = await this.jwtService.verify(tokenValue);
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
				// checker.online(res.userid, new Date);
				// checker.print();
			}
			catch(err) {
				this.logger.log(`${socket.id} socket disconnected - force : Invalid Token`, "AuthGateway");
				socket.disconnect();
				return ;
			}
		}
  	}

	async handleDisconnect(@ConnectedSocket() socket: AuthSocket) {
		this.logger.log(`${socket.id} socket disconnected`, "AuthGateway");
		const userid = onlineManager.userIdOf(socket.id);
		const user = await getCustomRepository(UserRepository).findOne(userid);
		if (!user)
			return ;
		/* ----- */
		/* game : Exit game room*/
		MatchingManager.cancle(userid);
		await this.gameGatewayService.deleteMyMatch(user.userid);
		await this.chatGatewayService.offlineMyChatRoom(socket);
		await this.gameGatewayService.offlineMyGameRoom(socket);
		onlineManager.offline(socket);
		onlineManager.print();
		// checker.offline(socket.userid, new Date);
		setTimeout(async ()=>{
			const userid = socket.userid;
			const socketid = socket.id;
			console.log(`${userid} has been disconnected. : 3sec`);
			const repo_user = getCustomRepository(UserRepository);
			if (!onlineManager.isOnline(userid)) {
				repo_user.logout(user);
				const membership = await getCustomRepository(GameMembershipRepository).getMyRoom(userid);
				if (membership)
					await this.gameGatewayService.exitGameRoom(socketid, userid, membership.gameRoom.roomid);
				delete socket.userid;
			}
			console.log("-------SETIMEOUT OVER");
		}, 3000);
	}
}
