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

const options = {
    cors : {
        origin : CORS_ORIGIN,
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
  
    private async afterInit(server: Server) {
        this.logger.log('Gamegateway init');
    }

    private log(msg : any) {
        this.logger.log(msg, "GameGateway");
    }

    private over(gateway : string) {
        // console.log(`[${gateway} is over]---------\n`);
    }

    //test
    @ApiOperation({ summary: 'test ', description: ''})
    @SubscribeMessage('onlineGame')
    async print(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        this.log({gate : "onlineGame", ...payload});
    }

    @SubscribeMessage('createGameRoom') 
    async createGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : CreateGameRoomDTO) {
        this.log({gate : "createGameRoom", ...payload});
        console.log("id : ", socket.userid);
        if (!socket.userid) {
            this.log("Something wrong : Authenticate");
            return ;
        }
        const user = await getCustomRepository(UserRepository).findOne(socket.userid);
        if (await this.gameGatewayService.amIinGameRoom(user)) {
            this.gameGatewayService.respondToUser(socket, "createGameRoom", {result : false});
            return this.over("createGameRoom");
        }
        if (!this.gameGatewayService.validateOptions(payload)) {
            let reason = this.gameGatewayService.whyCantCreate(payload);
        	this.log(`${user.nickname} are trying to create game room with wrong options : ${reason}`);
        	this.gameGatewayService.respondToUser(socket, "createGameRoom", {result : false});
            return this.over("createGameRoom");
        }
        const roomInfo = await this.gameGatewayService.createAndEnterGameRoom(socket, user, payload);
        this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
        return this.over("createGameRoom");
    }

    @SubscribeMessage('enterGameRoom')
    async enterGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : EnterGameRoomDTO) {
        this.log({gate : "enterGameRoom", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        if (await this.gameGatewayService.amIinGameRoom(user)) {
            this.gameGatewayService.respondToUser(socket, "enterGameRoom", {message : "You are already in the game room"});
            return this.over("enterGameRoom");
        }
        const validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs(payload);
        if (!validateResult.result) {
            this.gameGatewayService.respondToUser(socket, "enterGameRoom", {message : "It is not avaliable to join this game room"});
            return this.over("enterGameRoom");
        }
        const roomInfo = await this.gameGatewayService.enterGameRoom(socket.id, user, validateResult.gameRoom, payload);
        this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
        return this.over("enterGameRoom");
    }

    @SubscribeMessage('updateGameRoom')
    async updateGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        // const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        // const gameRoom = await getCustomRepository(GameRoomRepository).findOne({roomid : payload.roomid});
        const userid = onlineManager.userIdOf(socket.id);
        const membership = await getCustomRepository(GameMembershipRepository).findOne({gameRoom : {roomid : payload.roomid}, member : {userid : userid}});
        if (!membership)
            return ;
        const roomInfo = await getCustomRepository(GameRoomRepository).getRoomInfoWithMemberlist(payload.roomid);
        this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
    }


    @SubscribeMessage('exitGameRoom')
    async exitGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        this.log({gate : "exitGameRoom", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
		if (! (await this.gameGatewayService.isThisMyGameRoom(user, payload.roomid))) {
			this.log(`${user.nickname} isn't in the GameRoom ${payload.roomid}`);
            return this.over('exitGameRoom');
		}
        const gameRoom = await this.gameGatewayService.exitGameRoom(socket, user, payload.roomid);
        this.gameGatewayService.respondToUser(socket, "exitGameRoom", {roomid : gameRoom.roomid});
        return this.over("exitGameRoom");
    }

    @SubscribeMessage('changeGameRoom')
    async changeGameRoomOptions(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : ChangeGameRoomDTO) {
        this.log({gate : "changeGameRoom", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        if (!await this.gameGatewayService.validationAuthority(user, payload.roomid)) {
            this.gameGatewayService.respondToUser(socket, "changeGameRoom", {result : false});
            return this.over('changeGameRoom');
        }	
        if (!await this.gameGatewayService.checkIfItIsAvailableChangeOptions(payload.roomid)) {
            this.gameGatewayService.respondToUser(socket, "changeGameRoom", {result : false});
            return this.over('changeGameRoom');
        }
        await this.gameGatewayService.changeGameRoomOptions(payload);
        return this.over('changeGameRoom');
    }

    @SubscribeMessage('gameRoomList') 
    async getGameroomList(@ConnectedSocket() socket : AuthSocket) {
        this.log({gate : "gameRoomList"});
        const result = await this.gameGatewayService.getAllGameRoomList();
        this.gameGatewayService.respondToUser(socket, "gameRoomList", result);
        return this.over('gameRoomList');
    }

    @SubscribeMessage('startGame')
    async start(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO){
        this.log({gate : "startGame", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        this.log(`${user.nickname} pressed the start button`);
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom")
            return this.over('startGame');
        }
        if (!await this.gameGatewayService.validationAuthority(user, game.id)) {
            this.log(`${user.nickname} has no authority to start game.`);
            return this.over('startGame');
        }
        if (!game.checkIfItCanStart()) {
            this.log("This room can't start the game")
            return this.over('startGame');
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
        await game.start();
    }

    @SubscribeMessage('move')
    async move(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameMoveDTO) {
        this.log({gate : "move", ...payload});
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom")
            return this.over('move');
        }
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        game.chagnePlayersDirection(user.userid, payload.direction);
        return this.over('move');
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
				this.log("No one is waiting.")
				MatchingManager.putOnTheWaitingList(user.userid);
                return this.over('randomMatching');
			}
			const theOtherId = MatchingManager.getOne();
			const options = MatchingManager.generateGameRoomOptions();
			if (await this.gameGatewayService.amIinGameRoom(user)) {
                this.gameGatewayService.respondToUser(socket, "randomMatching", {result : false});
                return this.over('randomMatching');
            }	
			let roomInfo = await this.gameGatewayService.createAndEnterGameRoom(socket, user, options);
			this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
			const repo_user = getCustomRepository(UserRepository);
			const theOther = await repo_user.findOne({userid : theOtherId});
			const validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs({roomid : roomInfo.roomid, isPlayer : true});
			const theOthersocketId : string = onlineManager.socketIdOf(theOtherId);
            roomInfo = await this.gameGatewayService.enterGameRoom(theOthersocketId, theOther, validateResult.gameRoom, {isPlayer : true});
			this.server.to(theOthersocketId).emit("enterGameRoom", roomInfo);
            return this.over('randomMatching');
		}
		else {
			let randomizedIndex = MatchingManager.getRandomInt(0, lists.length);
			if (await this.gameGatewayService.amIinGameRoom(user)) {
                this.gameGatewayService.respondToUser(socket, "enterGameRoom", {message : "You are already in the game room"});
                return this.over('randomMatching');
            }	
			let validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs({roomid : lists[randomizedIndex].roomid, isPlayer : true});
			while (!validateResult.result) {
				randomizedIndex = MatchingManager.getRandomInt(0, lists.length);
				validateResult = await this.gameGatewayService.checkIfItIsAvailableToJoinAs({roomid : lists[randomizedIndex].roomid, isPlayer : true});
			}
			const roomInfo = await this.gameGatewayService.enterGameRoom(socket.id, user, validateResult.gameRoom, {isPlayer : true});
			this.gameGatewayService.respondToUser(socket, "enterGameRoom", roomInfo);
            return this.over('randomMatching');
		}
	}

	@SubscribeMessage('randomMatchingCancel')
	async cancleRandomMatching(@ConnectedSocket() socket : AuthSocket) {
		this.log({gate : "randomMatchingCancel"});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
		MatchingManager.cancle(user.userid);
        return this.over('randomMatchingCancle');
	}

	@SubscribeMessage('matchResponse')
	async matchResponse(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : MatchResponseDTO) {
        this.log({gate : "matchResponse", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
		const request = await this.gameGatewayService.validateRequestStatus(payload.requestid);
        if (!request || !onlineManager.isOnline(request.owner.userid)) {
            this.log("Bad Reqeust")
            return this.over("matchResponse");
        }
    	const theOtherSocketId = onlineManager.socketIdOf(request.owner.userid);
		if (await this.gameGatewayService.amIinGameRoom(user) || payload.result === false) {
			this.log("You are already in the gameroom OR you rejected");
            this.gameGatewayService.deleteMatch(request);
			this.server.to(theOtherSocketId).emit("matchRequest",  {result : false});
			return this.over("matchResponse");
		}
        console.log("1-------");
		const result = await this.gameGatewayService.enterMatch(socket, request, user);
		this.server.to(theOtherSocketId).emit("enterGameRoom", await this.gameGatewayService.getGameRoomInfo(request.roomid));
        console.log("2-------");
        this.gameGatewayService.respondToUser(socket, "enterGameRoom", result);
        console.log("3-------");
        return this.over("matchResponse")
	}
	
	@SubscribeMessage('matchRequest')
	async matchRequest(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : MatchRequestDTO) {
        this.log({gate : "matchRequest", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
		const theOtherSocketId = onlineManager.socketIdOf(payload.userid);
        // 이미 요청했는지 확인 필요 &  게임중인지 등 확ㅇ인
        if (! await this.gameGatewayService.checkIfItIsAvailableRequest(user)) {
            this.gameGatewayService.respondToUser(socket, "matchRequest", {result : false}); //요청한 쪽에 거절되었다고 보내기
            return ;
        }
        const requestid = await this.gameGatewayService.createMatchRoom(socket, user);
		this.server.to(theOtherSocketId).emit("matchResponse", { 
			userid : user.userid, 
			nickname : user.nickname,
			requestid : requestid,
		});
        //matchresponse 처리 중에 타이머 되면 동작 안하도록 변경하기
		setTimeout(()=>{
			this.gameGatewayService.deleteMyMatch(user.userid);
            this.log(`Timeover : Match is deleted`);
            this.gameGatewayService.respondToUser(socket, "matchRequest", {result : false}); //요청한 쪽에 거절되었다고 보내기
		}, 30000);
        return this.over("matchRequest")
	}

    @SubscribeMessage('backToGameRoom')
    async backToGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        this.log({gate : "backToGameRoom", ...payload});
        const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such game Room");
            return this.over("backToGameRoom");
        };
        //게임 종료? 진행중 ? 존재 하는지?멤버인지 등등 확인
        this.log(`${user.nickname} want to back to game room`);
        await this.gameGatewayService.backToGameRoom(user, game);
        return this.over("backToGameRoom");
    }

    /*
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