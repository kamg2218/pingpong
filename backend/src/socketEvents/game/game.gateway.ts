import { Logger, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server } from "socket.io";
import { GameMembershipRepository, GameRoomRepository } from "src/db/repository/Game/GameCustomRepository";
import { UserRepository } from "src/db/repository/User/UserCustomRepository";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { getCustomRepository } from "typeorm";
import { GameGatewayService } from "./gameGateway.service";
import { MatchingManager } from "../online/matchingManager";
import { onlineGameMap } from "../online/onlineGameMap";
import { onlineManager } from "../online/onlineManager";
import { GameMoveDTO, EnterGameRoomDTO, ChangeGameRoomDTO, CreateGameRoomDTO, GameRoomInfoDTO, MatchResponseDTO, MatchRequestDTO,  } from "./dto/game.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { WsGuard } from "../ws.guard";
import { CORS_ORIGIN } from "src/config/url";

import { instrument } from "@socket.io/admin-ui";
import { Emitter } from "../auth/emitter";
import { Game } from "./gameElement/game";

const options = {
    cors : {
        origin : ["https://admin.socket.io"],
        credentials : true,
    }
}


@WebSocketGateway(options)
@UseGuards(WsGuard)
// @UsePipes(new ValidationPipe({      
//     whitelist : true,
//     // forbidNonWhitelisted : true,
//     transform : true}))
@ApiTags('GameGateway')
export class GameGateway {
    constructor(
        private readonly gameGatewayService : GameGatewayService,
        private readonly logger : Logger,
    ){}

    @WebSocketServer() public server: Server;
    private readonly emitter = new Emitter(this);

    private async afterInit(server: Server) {
        this.logger.log('Gamegateway init');
        Game.init(this.server);
        instrument(this.server, {auth : false});
    }

    private log(msg : any) {
        this.logger.log(msg, "GameGateway");
    }

    // private over(gateway : string) {
    //     // console.log(`[${gateway} is over]---------\n`);
    // }

    //test
    @ApiOperation({ summary: 'test ', description: ''})
    @SubscribeMessage('onlineGame')
    async print(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        this.log({gate : "onlineGame", ...payload});
    }

    @SubscribeMessage('createGameRoom') 
    async createGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : CreateGameRoomDTO) {
        this.log({gate : "createGameRoom", ...payload});
        console.log("enter : ", typeof(payload.password));
        if (!socket.userid) {
            this.log("Something wrong : Authenticate");
            return ;
        }
        const user = await getCustomRepository(UserRepository).findOne(socket.userid);
        if (await this.gameGatewayService.amIinGameRoom(user)) {
            this.emitter.emit(socket, "createGameRoom", {result : false});
            return ;
            // this.gameGatewayService.respondToUser(socket, "createGameRoom", {result : false});
            // return this.over("createGameRoom");
        }
        if (!this.gameGatewayService.validateOptions(payload)) {
            let reason = this.gameGatewayService.whyCantCreate(payload);
        	this.log(`${user.nickname} are trying to create game room with wrong options : ${reason}`);
        	this.emitter.emit(socket, "createGameRoom", {result : false});
            // this.gameGatewayService.respondToUser(socket, "createGameRoom", {result : false});
            return ;
            // return this.over("createGameRoom");
        }
        const roomInfo = await this.gameGatewayService.createAndEnterGameRoom(socket, user, payload);
        // console.log("roominfo : ", roomInfo);
        this.emitter.emit(socket, "enterGameRoom", roomInfo);
        return ;
        // this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
        // return this.over("createGameRoom");
    }

    @SubscribeMessage('enterGameRoom')
    async enterGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : EnterGameRoomDTO) {
        this.log({gate : "enterGameRoom", ...payload});
        console.log("enter : ", typeof(payload.password));
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        if (await this.gameGatewayService.amIinGameRoom(user)) {
            this.emitter.emit(socket, "enterGameRoom", {message : "You are already in the game room"});
            return ;
            // this.gameGatewayService.respondToUser(socket, "enterGameRoom", {message : "You are already in the game room"});
            // return this.over("enterGameRoom");
        }
        const validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs(payload);
        if (!validateResult.result) {
            this.emitter.emit(socket, "enterGameRoom", {message : "It is not avaliable to join this game room"});
            return ;
            // this.gameGatewayService.respondToUser(socket, "enterGameRoom", {message : "It is not avaliable to join this game room"});
            // return this.over("enterGameRoom");
        }
        const roomInfo = await this.gameGatewayService.enterGameRoom(socket.id, user, validateResult.gameRoom, payload);
        console.log("roominfo : ", roomInfo);
        this.emitter.emit(socket, "enterGameRoom", roomInfo);
        // this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
        const game = onlineGameMap[roomInfo.roomid];
        if (game.running) {
            const initialInfo = await game.getInitialInfo();
            this.emitter.emit(socket, "startGame", initialInfo);
            // socket.emit("startGame", initialInfo);
        }
        game.print();
        // return this.over("enterGameRoom");
    }

    @SubscribeMessage('updateGameRoom')
    async updateGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        const userid = onlineManager.userIdOf(socket.id);
        const membership = await getCustomRepository(GameMembershipRepository).findOne({gameRoom : {roomid : payload.roomid}, member : {userid : userid}});
        if (!membership)
            return ;
        const roomInfo = await getCustomRepository(GameRoomRepository).getRoomInfoWithMemberlist(payload.roomid);
        console.log("[]-----------------");
        this.emitter.emit(socket, "enterGameRoom", roomInfo);
        // this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);

    }


    @SubscribeMessage('exitGameRoom')
    async exitGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        this.log({gate : "exitGameRoom", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
		if (! (await this.gameGatewayService.isThisMyGameRoom(user, payload.roomid))) {
			this.log(`${user.nickname} isn't in the GameRoom ${payload.roomid}`);
            return ;
            // return this.over('exitGameRoom');
		}
        const roomid = await this.gameGatewayService.exitGameRoom(socket.id, user, payload.roomid);
        this.emitter.emit(socket, "exitGameRoom", {roomid : roomid});
        // this.gameGatewayService.respondToUser(socket, "exitGameRoom", {roomid : gameRoom.roomid});
        // return this.over("exitGameRoom");
    }

    @SubscribeMessage('changeGameRoom')
    async changeGameRoomOptions(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : ChangeGameRoomDTO) {
        this.log({gate : "changeGameRoom", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        if (!await this.gameGatewayService.validationAuthority(user, payload.roomid)) {
            this.emitter.emit(socket, "changeGameRoom", {result : false});
            return ;
            // this.gameGatewayService.respondToUser(socket, "changeGameRoom", {result : false});
            // return this.over('changeGameRoom');
        }	
        if (!await this.gameGatewayService.checkIfItIsAvailableChangeOptions(payload.roomid)) {
            this.emitter.emit(socket, "changeGameRoom", {result : false});
            return ;
            // this.gameGatewayService.respondToUser(socket, "changeGameRoom", {result : false});
            // return this.over('changeGameRoom');
        }
        await this.gameGatewayService.changeGameRoomOptions(payload);
        // return this.over('changeGameRoom');
    }

    @SubscribeMessage('gameRoomList') 
    async getGameroomList(@ConnectedSocket() socket : AuthSocket) {
        this.log({gate : "gameRoomList"});
        const result = await this.gameGatewayService.getAllGameRoomList();
        this.emitter.emit(socket, "gameRoomList", result);
        return;
        // this.gameGatewayService.respondToUser(socket, "gameRoomList", result);
        // return this.over('gameRoomList');
    }

    @SubscribeMessage('startGame')
    async start(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO){
        this.log({gate : "startGame", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        this.log(`${user.nickname} pressed the start button`);
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom");
            return ;
        }
        if (!await this.gameGatewayService.validationAuthority(user, game.id)) {
            this.log(`${user.nickname} has no authority to start game.`);
            return ;
        }
        if (!game.checkIfItCanStart()) {
            this.log("This room can't start the game");
            return ;
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
        await this.gameGatewayService.switchGameRoomStatus(game.id, "running");
        await game.start();
    }

    @SubscribeMessage('move')
    async move(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameMoveDTO) {
        this.log({gate : "move", ...payload});
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom");
            return ;
            // return this.over('move');
        }
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        game.chagnePlayersDirection(user.userid, payload.direction);
        return ;
        // return this.over('move');
    }

	@SubscribeMessage('randomMatching')
	async requestRandomMatching(@ConnectedSocket() socket : AuthSocket) {
	    this.log({gate : "randomMatching"});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const lists = await repo_gameRoom.getWaitingGameRoom();
		if (!lists.length) {
			this.log("No public waiting room");
			if (!MatchingManager.isThereWaitingUser()) {
				this.log("No one is waiting.");
				MatchingManager.putOnTheWaitingList(user.userid);
                return ;
                // return this.over('randomMatching');
			}
			const theOtherId = MatchingManager.getOne();
			const options = MatchingManager.generateGameRoomOptions();
			if (await this.gameGatewayService.amIinGameRoom(user)) {
                this.emitter.emit(socket, "randomMatching", {result : false});
                return ;
                // this.gameGatewayService.respondToUser(socket, "randomMatching", {result : false});
                // return this.over('randomMatching');
            }	
			let roomInfo = await this.gameGatewayService.createAndEnterGameRoom(socket, user, options);
			this.emitter.emit(socket, "enterGameRoom", roomInfo);
            // this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
			const repo_user = getCustomRepository(UserRepository);
			const theOther = await repo_user.findOne({userid : theOtherId});
			const validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs({roomid : roomInfo.roomid, isPlayer : true});
			const theOthersocketId : string = onlineManager.socketIdOf(theOtherId);
            roomInfo = await this.gameGatewayService.enterGameRoom(theOthersocketId, theOther, validateResult.gameRoom, {isPlayer : true});
			this.emitter.emitById(theOthersocketId, "enterGameRoom", roomInfo);
            const game = onlineGameMap[roomInfo.roomid];
            console.log(game);
            // this.server.to(theOthersocketId).emit("enterGameRoom", roomInfo);
            return ;
            // return this.over('randomMatching');
		}
		else {
			let randomizedIndex = MatchingManager.getRandomInt(0, lists.length);
			if (await this.gameGatewayService.amIinGameRoom(user)) {
                this.emitter.emit(socket, "enterGameRoom", {message : "You are already in the game room"});
                return ;
                // this.gameGatewayService.respondToUser(socket, "enterGameRoom", {message : "You are already in the game room"});
                // return this.over('randomMatching');
            }	
			let validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs({roomid : lists[randomizedIndex].roomid, isPlayer : true});
			while (!validateResult.result) {
				randomizedIndex = MatchingManager.getRandomInt(0, lists.length);
				validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs({roomid : lists[randomizedIndex].roomid, isPlayer : true});
			}
			const roomInfo = await this.gameGatewayService.enterGameRoom(socket.id, user, validateResult.gameRoom, {isPlayer : true});
			this.emitter.emit(socket, "enterGameRoom", roomInfo);
            // this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
            // return this.over('randomMatching');
            return ;
		}
	}

	@SubscribeMessage('randomMatchingCancel')
	async cancleRandomMatching(@ConnectedSocket() socket : AuthSocket) {
		this.log({gate : "randomMatchingCancel"});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
		MatchingManager.cancle(user.userid);
        return ;
        // return this.over('randomMatchingCancle');
	}

	@SubscribeMessage('matchResponse')
	async matchResponse(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : MatchResponseDTO) {
        this.log({gate : "matchResponse", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
		const request = await this.gameGatewayService.validateRequestStatus(payload.requestid);
        if (!request || !onlineManager.isOnline(request.owner.userid)) {
            this.log("Bad Reqeust")
            return ;
            // return this.over("matchResponse");
        }
    	const theOtherSocketId = onlineManager.socketIdOf(request.owner.userid);
		if (await this.gameGatewayService.amIinGameRoom(user) || payload.result === false) {
			this.log("You are already in the gameroom OR you rejected");
            this.gameGatewayService.deleteMatch(request);
            this.emitter.emitById(theOtherSocketId, "matchRequest",  {result : false});
            return ;
		}
		const result = await this.gameGatewayService.enterMatch(socket, request, user);
        this.emitter.emitById(theOtherSocketId, "enterGameRoom", result);
        this.emitter.emit(socket, "enterGameRoom", result);
        return ;
	}
	
	@SubscribeMessage('matchRequest')
	async matchRequest(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : MatchRequestDTO) {
        this.log({gate : "matchRequest", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
		const theOtherSocketId = onlineManager.socketIdOf(payload.userid);
        // 이미 요청했는지 확인 필요 &  게임중인지 등 확인
        if (! await this.gameGatewayService.checkIfItIsAvailableRequest(user, payload.userid)) {
            this.emitter.emit(socket, "matchRequest", {result : false});
            // this.gameGatewayService.respondToUser(socket, "matchRequest", {result : false}); //요청한 쪽에 거절되었다고 보내기
            return ;
        }
        const requestid = await this.gameGatewayService.createMatchRoom(socket, user);
        this.emitter.emitById(theOtherSocketId, "matchResponse", { 
			userid : user.userid, 
			nickname : user.nickname,
			requestid : requestid,
		});

        // ! matchresponse 처리 중에 타이머 되면 동작 안하도록 변경하기
        // 이미 처리가 된 경우?
		setTimeout(()=>{
			this.gameGatewayService.deleteMyMatch(user.userid);
            this.log(`Timeover : Match is deleted`);
            this.emitter.emit(socket, "matchRequest", {result : false});
		}, 30000);
        // return this.over("matchRequest")
        return ;
	}
/*
    @SubscribeMessage('backToGameRoom')
    async backToGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        this.log({gate : "backToGameRoom", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such game Room");
            return ;
            // return this.over("backToGameRoom");
        };
        //게임 종료? 진행중 ? 존재 하는지?멤버인지 등등 확인
        this.log(`${user.nickname} want to back to game room`);
        await this.gameGatewayService.backToGameRoom(user, game);
        return ;
        // return this.over("backToGameRoom");
    }

    
    @SubscribeMessage('pauseGame')
    async pause(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        this.log({gate : "pauseGame", ...payload});
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom")
            return this.over('pauseGame');
        }
        game.pause()
        return this.over('pauseGame');
    }

    @SubscribeMessage('restartGame')
    async restart(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        this.log({gate : "restartGame", ...payload});
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom")
            return this.over('restartGame');
        }
        game.restart();
        return this.over('restartGame');
    }

    @SubscribeMessage('speedUp')
    async speedUp(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        this.log({gate : "speedUp", ...payload});
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom");
            return this.over('speedUp');
        }
        game.ballSpeed("up");
        return this.over('speedUp');
    }

    @SubscribeMessage('speedDown')
    async speedDown(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        this.log({gate : "speedDown", ...payload});
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom");
            return this.over('speedDown');
        }
        game.ballSpeed("down");
        return this.over('speedDown');
    }
    */
}