import { Logger, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { GameGatewayService } from "./gameGateway.service";
import { MatchingManager } from "../online/matchingManager";
import { onlineGameMap } from "../online/onlineGameMap";
import { onlineManager } from "../online/onlineManager";
import { GameMoveDTO, EnterGameRoomDTO, ChangeGameRoomDTO, CreateGameRoomDTO, GameRoomInfoDTO, MatchResponseDTO, MatchRequestDTO, InviteGameRoomResponseDTO, InviteGameRoomDTO } from "./dto/game.dto";
import { ApiTags } from "@nestjs/swagger";
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

    /*ok*/
    @SubscribeMessage('createGameRoom') 
    async createGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : CreateGameRoomDTO) {
        this.log({gate : "createGameRoom", ...payload});

        const {result, reason, user} = await this.gameGatewayService.checkIfItIsAvailableCreate(socket.userid, payload);
        if (!result) {
            this.log(`${socket.userid} can't create GameRoom : ${reason}`);
            this.emitter.emit(socket, "createGameRoom", {result : false});
            return ;
        }
        const enterResult = await this.gameGatewayService.createAndEnterGameRoom(socket.id, user, payload);
        if (!enterResult.result) {
            this.log(`Failed to create Game Room  : ${enterResult.reason}`);
            this.emitter.emit(socket, "createGameRoom", {result : false});
            return ;
        }
        return ;
    }

    /*ok*/
    @SubscribeMessage('enterGameRoom')
    async enterGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : EnterGameRoomDTO) {
        this.log({gate : "enterGameRoom", ...payload});
        const {result, reason, user, gameRoom} = await this.gameGatewayService.checkIfItIsAvailableToJoin(socket.userid, payload);
        if (!result) {
            this.log(`${socket.userid} can't enter the GameRoom : ${reason}`);
            this.emitter.emit(socket, "enterGameRoom", {message : reason});
            return ;
        }
        const roomid = await this.gameGatewayService.enterGameRoom(socket.id, user, gameRoom, payload);
        if (!roomid) {
            this.log(`${socket.userid} can't enter the GameRoom : Something wrong`);
            this.emitter.emit(socket, "enterGameRoom", {message : "Something wrong"});
            return ;  
        }
        // const game = onlineGameMap[roomid];
        // if (game.running) {
        //     const initialInfo = await game.getInitialInfo();
        //     this.emitter.emit(socket, "startGame", initialInfo);
        // }
    }
    
    /* payload : userid : string, roomid : string */
    @SubscribeMessage('inviteGameRoom')
    async inviteGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : InviteGameRoomDTO) {
        this.log({gate : "inviteGameRoom", ...payload});

        const {result, reason} = await this.gameGatewayService.checkIfItIsAvailableInvite(socket.userid, payload);
        if (!result) {
            this.log(`${socket.userid} can't invite. : ${reason}`);
            // this.emitter.emit(socket, "inviteGameRoom", {result : false});
            return ;
        }
        const requestInfo = await this.gameGatewayService.getInviteRequestInfo(socket.userid, payload.roomid);
        const theOtherSocketId = onlineManager.socketIdOf(payload.userid);
        if (requestInfo)
            this.emitter.emitById(theOtherSocketId, "inviteGameRoomResponse", requestInfo);
        return ;
    }
    
    /* payload : requestid : string, result : boolean */
    @SubscribeMessage('inviteGameRoomResponse')
    async inviteGameRoomResponse(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : InviteGameRoomResponseDTO) {
        this.log({gate : "inviteGameRoomResponse", ...payload});
        
        if (!payload.result)
            return ;
        const {result, reason, user, gameRoom} = await this.gameGatewayService.checkIfItIsAvailableToJoin(socket.userid, {roomid : payload.requestid, isPlayer : true, password : "*"});
        if (!result) {
            this.log(`${socket.userid}, abnormal request : ${reason}`);
            return ;
        }
        const roomid = await this.gameGatewayService.enterGameRoom(socket.id, user, gameRoom, {roomid : payload.requestid, isPlayer : true, password : "*"});
        if (!roomid) {
            this.log(`${socket.userid} can't enter the GameRoom : Something wrong`);
            return ;  
        }
    }



    /* ok */
    @SubscribeMessage('updateGameRoom')
    async updateGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        if (!await this.gameGatewayService.isThisMyGameRoom(socket.userid, payload.roomid))
            return ;
        const roomInfo = await this.gameGatewayService.getMyGameRoomInfoWithMemberList(payload.roomid);
        if (roomInfo)
            this.emitter.emit(socket, "enterGameRoom", roomInfo);
    }

    /* ok */
    @SubscribeMessage('exitGameRoom')
    async exitGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO) {
        this.log({gate : "exitGameRoom", ...payload});
    
        const {result, reason} = await this.gameGatewayService.checkIfItIsAvailableExit(socket.userid, payload.roomid);
        if (!result) {
            this.log(`${socket.userid} can't exit the Game Rroom ${payload.roomid}. becasue : ${reason}`);
            return ;
        }
        const roomid = await this.gameGatewayService.exitGameRoom(socket.id, socket.userid, payload.roomid);
        if (roomid)
            this.emitter.emit(socket, "exitGameRoom", {roomid : roomid});
    }

    /* ok */
    @SubscribeMessage('changeGameRoom')
    async changeGameRoomOptions(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : ChangeGameRoomDTO) {
        this.log({gate : "changeGameRoom", ...payload});

        if (!await this.gameGatewayService.validationAuthority(socket.userid, payload.roomid)) {
            this.emitter.emit(socket, "changeGameRoom", {result : false});
            return ;
        }	
        if (!await this.gameGatewayService.checkIfItIsAvailableChangeOptions(payload.roomid)) {
            this.emitter.emit(socket, "changeGameRoom", {result : false});
            return ;
        }
        await this.gameGatewayService.changeGameRoomOptions(payload);
    }


    @SubscribeMessage('gameRoomList') 
    async getGameroomList(@ConnectedSocket() socket : AuthSocket) {
        this.log({gate : "gameRoomList"});
        const result = await this.gameGatewayService.getAllGameRoomList();
        this.emitter.emit(socket, "gameRoomList", result);
        return;
    }

    /* ok */
    @SubscribeMessage('startGame')
    async start(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameRoomInfoDTO){
        this.log({gate : "startGame", ...payload});
    
        const {result, reason} = await this.gameGatewayService.checkIfItIsAvailableStartGame(socket.userid, payload.roomid);
        if (!result) {
            this.log(`${socket.userid} can't start game. becase : ${reason}`);
            return ;
        }
        await this.gameGatewayService.startGame(payload.roomid);
    }

    /* ok */
    @SubscribeMessage('move')
    async move(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : GameMoveDTO) {
        // this.log({gate : "move", ...payload});

        this.gameGatewayService.movePlayers(socket.userid, payload)
    }

    /* ok */
    @SubscribeMessage('randomMatching')
    async requestRandomMatching(@ConnectedSocket() socket : AuthSocket) {
        this.log({gate : "randomMatching"});

        let result = await this.gameGatewayService.enterExistingGameRoom(socket.id, socket.userid);
        if (result.reason) {
            this.log(`Failed to request random Matching : ${result.reason}`);
            this.emitter.emit(socket, "randomMatching", {result : false});
            return ;
        }
        else if (result.isEntered)
            return ;
        result = await this.gameGatewayService.enterExsitingMatch(socket.userid);
        if (result.reason) {
            this.log(`Failed to request random Matching : ${result.reason}`);
            this.emitter.emit(socket, "randomMatching", {result : false});
            return ;
        }
        else if (result.isEntered)
            return ;
        this.gameGatewayService.putOntheList(socket.userid);
        return ;
    }

    /* ok */
	@SubscribeMessage('randomMatchingCancel')
	async cancleRandomMatching(@ConnectedSocket() socket : AuthSocket) {
		this.log({gate : "randomMatchingCancel"});

		MatchingManager.cancle(socket.userid);
        return ;
	}

    /*ok*/
	@SubscribeMessage('matchResponse')
	async matchResponse(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : MatchResponseDTO) {
        this.log({gate : "matchResponse", ...payload});
        const {result, reason, user, request } = await this.gameGatewayService.checkIfItIsAvailableResponseMatchRQ(socket.userid, payload);
        if (!result && !request) {
            this.log(`Bad Request : ${reason}`);
            return ;
        }
        let theOtherSocketId = onlineManager.socketIdOf(request.owner.userid);
        if (!result) {
            this.log(`Bad Request : ${reason}`);
            this.emitter.emitById(theOtherSocketId, "matchRequest",  {result : false});
            return ;
        }
        if (await this.gameGatewayService.isItrejected(payload, request)) {
            this.gameGatewayService.rejectReqesut(request);
            this.log(`Request is rejected`);
            this.emitter.emitById(theOtherSocketId, "matchRequest",  {result : false});
            return ;
        }
        if (!await this.gameGatewayService.acceptRequest(request, user)) {
            this.log(`Something wrong`);
            this.gameGatewayService.rejectReqesut(request);
            this.emitter.emitById(theOtherSocketId, "matchRequest",  {result : false});
        }
	}
	
    /*ok*/
	@SubscribeMessage('matchRequest')
	async matchRequest(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : MatchRequestDTO) {
        this.log({gate : "matchRequest", ...payload});

        const {result, reason, user} = await this.gameGatewayService.checkIfItIsAvailableRequest(socket.userid, payload.userid);
        if (!result) {
            this.log(`Match Request is failed. because : ${reason}`);
            this.emitter.emit(socket, "matchRequest", {result : false});
            return ;
        }
        const theOtherSocketId = onlineManager.socketIdOf(payload.userid);
        const requestInfo = await this.gameGatewayService.createMatchRoom(user);
        this.emitter.emitById(theOtherSocketId, "matchResponse", requestInfo);
		setTimeout(async ()=>{
			if (await this.gameGatewayService.deleteMyMatch(user.userid)) {
                this.log(`Timeover : Match is deleted`);
                this.emitter.emit(socket, "matchRequest", {result : false});
            }
		}, 15000);
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