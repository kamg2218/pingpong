import { Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server } from "socket.io";
import { GameRoomRepository } from "src/db/repository/Game/GameRoom.repository";
import { UserRepository } from "src/db/repository/User/UserCustomRepository";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { getCustomRepository } from "typeorm";
import { LevelManager } from "./gameElement/levelManager";
import { GameGatewayService } from "./gameGateway.service";
import { MatchingManager } from "./online/matchingManager";
import { onlineGameMap } from "./online/onlineGameMap";
import { onlineManager } from "./online/onlineManager";

const options = {
    cors : {
        origin : ["http://localhost:3000", "https://admin.socket.io"],
        credentials : true,
    }
}
  
@WebSocketGateway(options)
// @UseGuards(AuthGuard('jwt'))
export class GameGateway {
    constructor(
        private readonly gameGatewayService : GameGatewayService,
        private readonly logger : Logger
    ){}

    @WebSocketServer() public server: Server;
  
    private async afterInit(server: Server) {
        this.logger.log('Gamegateway init');
      }

    private log(msg : String) {
        this.logger.log(msg, "GameGateway");
    }

    //test
    @SubscribeMessage('onlineGame')
    async print(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        console.log(onlineGameMap);
    }

    @SubscribeMessage('createGameRoom') 
    async createGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload.myNickname});
        /* ------- */
        if (await this.gameGatewayService.amIinGameRoom(user))
        	return this.gameGatewayService.respondToUser(socket, "createGameRoom", {result : false});
        if (!this.gameGatewayService.validateOptions(payload)) {
        	this.log(`${user.nickname} are trying to create game room with wrong options`);
        	return this.gameGatewayService.respondToUser(socket, "createGameRoom", {result : false});
        }
        const roomInfo = await this.gameGatewayService.createAndEnterGameRoom(socket, user, payload);
        this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
    }

    @SubscribeMessage('enterGameRoom')
    async enterGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
        const payload = {
        	roomid : roomid,
        	isPlayer : payload1.isPlayer,
        	password : payload1.password
        }
        /* ------- */
        if (await this.gameGatewayService.amIinGameRoom(user))
        	return this.gameGatewayService.respondToUser(socket, "enterGameRoom", {message : "You are already in the game room"});
        const validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs(payload);
        if (!validateResult.result)
        	return this.gameGatewayService.respondToUser(socket, "enterGameRoom", {message : "It is not avaliable to join this game room"});
        const roomInfo = await this.gameGatewayService.enterGameRoom(socket.id, user, validateResult.gameRoom, payload);
        this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
    }

    @SubscribeMessage('exitGameRoom')
    async exitGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
        const payload = {
        	roomid : roomid,
        }
        /* ------- */
		if (! (await this.gameGatewayService.isThisMyGameRoom(user, roomid))) {
			this.log(`${user.nickname} isn't in the GameRoom ${payload1.title}`);
			throw new WsException(`You are not in the GameRoom ${payload1.title}`);
		}
        const gameRoom = await this.gameGatewayService.exitGameRoom(socket, user, payload.roomid);
        this.gameGatewayService.respondToUser(socket, "exitGameRoom", {roomid : gameRoom.roomid});
    }

    @SubscribeMessage('changeGameRoom')
    async changeGameRoomOptions(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
        const payload = {
          roomid : roomid,
          title : payload1.title,
          password : payload1.password,
          speed : payload1.speed,
          type : payload1.type
        }
        /* ------- */
        if (!await this.gameGatewayService.validationAuthority(user, payload.roomid))
        	return this.gameGatewayService.respondToUser(socket, "changeGameRoom", {result : false});
        if (!await this.gameGatewayService.checkIfItIsAvailableChangeOptions(payload.roomid))
        	return this.gameGatewayService.respondToUser(socket, "changeGameRoom", {result : false});
        await this.gameGatewayService.changeGameRoomOptions(payload);
    }

    @SubscribeMessage('gameRoomList') 
    async getGameroomList(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        const result = await this.gameGatewayService.getAllGameRoomList();
        this.gameGatewayService.respondToUser(socket, "gameRoomList", result);
    }

    @SubscribeMessage('gameRoomListIncluding') 
    async getGameroomListIncluding(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        const result = await this.gameGatewayService.getGameRoomIncluding(payload.title);
        this.gameGatewayService.respondToUser(socket, "gameRoomListIncluding", result);
    }

    //방장인지 확인 필요
    @SubscribeMessage('startGame')
    async start(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const payload = {
            title : payload1.title
        }
        /* ------- */
        this.log(`${user.nickname} pressed the start button`);
        const gameRoom = await getCustomRepository(GameRoomRepository).findOne({title : payload.title});
        const game = onlineGameMap[gameRoom.roomid];
        if (!game) {
            this.log("No such gameRoom")
            throw new WsException("No such gameRoom");
        }
        let proxy = new Proxy(game, {
        	set : (target, prop, value) => {
            	target.over = true;
            	if (value)
              		this.gameGatewayService.recordGameHistory(game.id);
            	return true;
          	}
        });
        game.proxy = proxy;
        if (!game.checkIfItCanStart()) {
            this.log("This room can't start the game")
            throw new WsException("This room can't start the game");
        }
        await game.start();
    }

    @SubscribeMessage('pauseGame')
    async pause(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const payload = {
            title : payload1.title
        }
        /* ------- */
        const gameRoom = await getCustomRepository(GameRoomRepository).findOne({title : payload.title});
        const game = onlineGameMap[gameRoom.roomid];
        if (!game) {
            this.log("No such gameRoom")
            throw new WsException("No such gameRoom");
        }
        game.pause()
    }

    @SubscribeMessage('restartGame')
    async restart(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const payload = {
            title : payload1.title
        }
        /* ------- */
        const gameRoom = await getCustomRepository(GameRoomRepository).findOne({title : payload.title});
        const game = onlineGameMap[gameRoom.roomid];
        if (!game) {
            this.log("No such gameRoom")
            throw new WsException("No such gameRoom");
        }
        game.restart();
    }

    @SubscribeMessage('speedUp')
    async speedUp(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const payload = {
            title : payload1.title
        }
        /* ------- */
        const gameRoom = await getCustomRepository(GameRoomRepository).findOne({title : payload.title});
        const game = onlineGameMap[gameRoom.roomid];
        if (!game) {
            this.log("No such gameRoom")
            throw new WsException("No such gameRoom");
        }
        game.ballSpeed("up")
    }

    @SubscribeMessage('speedDown')
    async speedDown(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const payload = {
            title : payload1.title
        }
        /* ------- */
        const gameRoom = await getCustomRepository(GameRoomRepository).findOne({title : payload.title});
        const game = onlineGameMap[gameRoom.roomid];
        if (!game) {
            this.log("No such gameRoom")
            throw new WsException("No such gameRoom");
        }
        game.ballSpeed("down");
    }


    @SubscribeMessage('move')
    async move(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        // const user = await getCustomRepository(UserRepository).findOne({nickname : payload.myNickname});
        const userid = onlineManager.userIdOf(socket.id);
        const gameRoom = await getCustomRepository(GameRoomRepository).findOne({title : "durian"});
        /* ------- */
        const game = onlineGameMap[gameRoom.roomid];
        if (!game) {
            this.log("No such gameRoom")
            throw new WsException("No such gameRoom");
        }
        game.chagnePlayersDirection(userid, payload.direction);
    }


	@SubscribeMessage('randomMatching')
	async requestRandomMatching(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
	    /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload.myNickname});
        /* ------- */
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const lists = await repo_gameRoom.getWaitingGameRoom();
		if (!lists.length) {
			this.log("No public waiting room");
			if (!MatchingManager.isThereWaitingUser()) {
				this.log("No one is waiting.")
				MatchingManager.putOnTheWaitingList(user.userid);
				return ;
			}
			const theOtherId = MatchingManager.getOne();
			const options = MatchingManager.generateGameRoomOptions();
			if (await this.gameGatewayService.amIinGameRoom(user))
				return this.gameGatewayService.respondToUser(socket, "randomMatching", {result : false});
			let roomInfo = await this.gameGatewayService.createAndEnterGameRoom(socket, user, options);
			this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
			const repo_user = getCustomRepository(UserRepository);
			const theOther = await repo_user.findOne({userid : theOtherId});
			const validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs({roomid : roomInfo.roomid, isPlayer : true});
			const theOthersocketId : string = onlineManager.socketIdOf(theOtherId);
            roomInfo = await this.gameGatewayService.enterGameRoom(theOthersocketId, theOther, validateResult.gameRoom, {isPlayer : true});
			this.server.to(theOthersocketId).emit("enterGameRoom", roomInfo);
		}
		else {
			let randomizedIndex = MatchingManager.getRandomInt(0, lists.length);
			if (await this.gameGatewayService.amIinGameRoom(user))
				return this.gameGatewayService.respondToUser(socket, "enterGameRoom", {message : "You are already in the game room"});
			let validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs({roomid : lists[randomizedIndex].roomid, isPlayer : true});
			while (!validateResult.result) {
				randomizedIndex = MatchingManager.getRandomInt(0, lists.length);
				validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs({roomid : lists[randomizedIndex].roomid, isPlayer : true});
			}
			const roomInfo = await this.gameGatewayService.enterGameRoom(socket.id, user, validateResult.gameRoom, {isPlayer : true});
			this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
            MatchingManager.print();
		}
	}

	@SubscribeMessage('randomMatchingCancel')
	async cancleRandomMatching(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
		/* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload.myNickname});
        /* ------- */
		MatchingManager.cancle(user.userid);
	}

	@SubscribeMessage('matchResponse')
	async matchResponse(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		/* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const payload = {
			reuqestid : payload1.requestid,
			result : payload1.result,
		};
		/* ------- */
		const request = await this.gameGatewayService.validateRequestStatus(payload.reuqestid);
    	if (!onlineManager.isOnline(request.owner.userid))
			throw new WsException("Bad Request");
    	const theOtherSocketId = onlineManager.socketIdOf(request.owner.userid);
		if (!request)
			throw new WsException("Bad request");
		if (this.gameGatewayService.amIinGameRoom(user) || payload.result === false) {
			this.gameGatewayService.deleteMatch(request);
			this.server.to(theOtherSocketId).emit("matchResponse",  {result : false});
			return ;
		}
        this.server.to(theOtherSocketId).emit("enterGameRoom", await this.gameGatewayService.getGameRoomInfo(request.roomid));
		const result = await this.gameGatewayService.enterMatch(socket, request, user);
		this.gameGatewayService.respondToUser(socket, "enterGameRoom", result);
	}
	
	@SubscribeMessage('matchRequest')
	async matchRequest(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		/* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const payload = {
			userid : (await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname})).userid,
		};
		/* ------- */
    	if (!await this.gameGatewayService.validateMatchRequest(user, payload.userid)) {
            this.log("Bad request")
            throw new WsException("Bad Reqeust");
        }
		const theOtherSocketId = onlineManager.socketIdOf(payload.userid);

        const requestid = await this.gameGatewayService.createMatchRoom(socket, user);
		this.server.to(theOtherSocketId).emit("matchRequest", { 
			userid : user.userid, 
			nickname : user.nickname,
			requestid : requestid,
		});
		setTimeout(()=>{
			this.gameGatewayService.deleteMyMatch(user.userid);
		}, 30000);
	}

    @SubscribeMessage('test')
	async test(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        console.log("Received test");
        socket.emit("test", {data : "success"});
        console.log("payload : ", payload1);
    }

    @SubscribeMessage('backToGameRoom')
    async backToGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        /* temp */
        /* change : user = onlinemap[socket.nsp.name][socket.id] */
        const user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        const payload = {
			roomid : (await getCustomRepository(GameRoomRepository).findOne({title : payload1.title})).roomid,
		};
		/* ------- */
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such game Room");
            throw new WsException("No such game room");
        };
        //게임 종료? 진행중 ? 존재 하는지?멤버인지 등등 확인
        this.log(`${user.nickname} want to back to game room`);
        await this.gameGatewayService.backToGameRoom(user, game);
    }
}