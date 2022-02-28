import { Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { env } from "process";
import { Server } from "socket.io";
import { CORS_ORIGIN } from "src/config/const";
import { User } from "src/db/entity/User/UserEntity";
import { GameRoomRepository } from "src/db/repository/Game/GameRoom.repository";
import { UserRepository } from "src/db/repository/User/UserCustomRepository";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { getCustomRepository } from "typeorm";
import { GameGatewayService } from "./gameGateway.service";
import { MatchingManager } from "./online/matchingManager";
import { onlineGameMap } from "./online/onlineGameMap";
import { onlineManager } from "./online/onlineManager";

const options = {
    cors : {
        origin : CORS_ORIGIN,
        credentials : true,
    }
}
  
@WebSocketGateway(options)
// @UseGuards(AuthGuard('ws-jwt'))
export class GameGateway {
    constructor(
        private readonly gameGatewayService : GameGatewayService,
        private readonly logger : Logger,
    ){}

    @WebSocketServer() public server: Server;
  
    private async afterInit(server: Server) {
        this.logger.log('Gamegateway init');
        console.log("ENV : ", env.DB_HOST);
    }

    private log(msg : string) {
        this.logger.log(msg, "GameGateway");
    }

    private over(gateway : string) {
        console.log(`[${gateway} is over]---------\n`)
    }

    public checkPayload(payload : any, checker : object) {
        for (let key in checker) {
            if (!payload[key])
                return false;
            let type = checker[key];
            if (type === "number") {
                Number.isInteger(payload[key])
            }
            else if (type === "string") {

            }
        }
    }

    //test
    @SubscribeMessage('onlineGame')
    async print(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        this.log({gate : "onlineGame", ...payload});
        if (process.env.NODE_ENV === "dev") {
            console.log('dev');
        }
        else
            console.log('else')
    }

    @SubscribeMessage('createGameRoom') 
    async createGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        this.log({gate : "createGameRoom", ...payload});
        let user : User;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload.myNickname});
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        }
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
    async enterGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "enterGameRoom", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
            payload = {
                roomid : roomid,
                isPlayer : payload1.isPlayer,
                password : payload1.password}
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
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

    @SubscribeMessage('exitGameRoom')
    async exitGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "exitGameRoom", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
            payload = {
        	    roomid : roomid}
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
		if (! (await this.gameGatewayService.isThisMyGameRoom(user, payload.roomid))) {
			this.log(`${user.nickname} isn't in the GameRoom ${payload1.title}`);
			// throw new WsException(`You are not in the GameRoom ${payload1.title}`);
            return this.over('exitGameRoom');
		}
        const gameRoom = await this.gameGatewayService.exitGameRoom(socket, user, payload.roomid);
        this.gameGatewayService.respondToUser(socket, "exitGameRoom", {roomid : gameRoom.roomid});
        return this.over("exitGameRoom");
    }

    @SubscribeMessage('changeGameRoom')
    async changeGameRoomOptions(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "changeGameRoom", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
            payload = {
                roomid : roomid,
                title : payload1.title,
                password : payload1.password,
                speed : payload1.speed,
                type : payload1.type}
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
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
    async getGameroomList(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload : any) {
        this.log({gate : "gameRoomList", ...payload});
        const result = await this.gameGatewayService.getAllGameRoomList();
        this.gameGatewayService.respondToUser(socket, "gameRoomList", result);
        return this.over('gameRoomList');
    }

    //방장인지 확인 필요
    @SubscribeMessage('startGame')
    async start(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "startGame", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
            payload = {
                roomid : payload1.roomid}
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
        this.log(`${user.nickname} pressed the start button`);
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom")
            // throw new WsException("No such gameRoom");
            return this.over('startGame');
        }
        if (!await this.gameGatewayService.validationAuthority(user, game.id)) {
            this.log(`${user.nickname} has no authority to start game.`);
            // throw new WsException("Not authorized")
            return this.over('startGame');
        }
        if (!game.checkIfItCanStart()) {
            this.log("This room can't start the game")
            // throw new WsException("This room can't start the game");
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

    @SubscribeMessage('pauseGame')
    async pause(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "pauseGame", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
            payload = {
                roomid : payload1.roomid}
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom")
            // throw new WsException("No such gameRoom");
            return this.over('pauseGame');
        }
        game.pause()
        return this.over('pauseGame');
    }

    @SubscribeMessage('restartGame')
    async restart(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "restartGame", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
            payload = {
                roomid : payload1.roomid}
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom")
            // throw new WsException("No such gameRoom");
            return this.over('restartGame');
        }
        game.restart();
        return this.over('restartGame');
    }

    @SubscribeMessage('speedUp')
    async speedUp(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "speedUp", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
            payload = {
                roomid : payload1.roomid}
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom")
            throw new WsException("No such gameRoom");
        }
        game.ballSpeed("up")
    }

    @SubscribeMessage('speedDown')
    async speedDown(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "speedDown", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
            payload = {
                roomid : payload1.roomid}
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom")
            throw new WsException("No such gameRoom");
        }
        game.ballSpeed("down");
    }


    @SubscribeMessage('move')
    async move(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "move", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            const {roomid} = await getCustomRepository(GameRoomRepository).findOne({title : payload1.title});
            payload = {
                roomid : payload1.roomid}
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
        
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom")
            // throw new WsException("No such gameRoom");
            return this.over('move');
        }
        game.chagnePlayersDirection(user.userid, payload.direction);
        return this.over('move');
    }


	@SubscribeMessage('randomMatching')
	async requestRandomMatching(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
	    this.log({gate : "randomMatching", ...payload1});
        let user : User;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        }
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
	async cancleRandomMatching(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
		this.log({gate : "randomMatchingCancel", ...payload1});
        let user : User;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
        }
		MatchingManager.cancle(user.userid);
        return this.over('randomMatchingCancle');
	}

	@SubscribeMessage('matchResponse')
	async matchResponse(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "matchResponse", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            payload = payload1;
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
		const request = await this.gameGatewayService.validateRequestStatus(payload.reuqestid);
        if (!request || !onlineManager.isOnline(request.owner.userid)) {
            this.log("Bad Reqeust")
            // throw new WsException("Bad request");
            return this.over("matchResponse")
        }
    	const theOtherSocketId = onlineManager.socketIdOf(request.owner.userid);
		if (this.gameGatewayService.amIinGameRoom(user) || payload.result === false) {
			this.gameGatewayService.deleteMatch(request);
			this.server.to(theOtherSocketId).emit("matchRequest",  {result : false});
			return this.over("matchResponse")
		}
        this.server.to(theOtherSocketId).emit("enterGameRoom", await this.gameGatewayService.getGameRoomInfo(request.roomid));
		const result = await this.gameGatewayService.enterMatch(socket, request, user);
		this.gameGatewayService.respondToUser(socket, "enterGameRoom", result);
        return this.over("matchResponse")
	}
	
	@SubscribeMessage('matchRequest')
	async matchRequest(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "matchRequest", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            payload = {
                userid : (await getCustomRepository(UserRepository).findOne({nickname : payload1.theOtherNickname})).userid,
            }
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
    	if (!await this.gameGatewayService.validateMatchRequest(user, payload.userid)) {
            this.log("Bad request")
            // throw new WsException("Bad Reqeust");
            return this.over("matchRequest")
        }
		const theOtherSocketId = onlineManager.socketIdOf(payload.userid);

        const requestid = await this.gameGatewayService.createMatchRoom(socket, user);
		this.server.to(theOtherSocketId).emit("matchResponse", { 
			userid : user.userid, 
			nickname : user.nickname,
			requestid : requestid,
		});
		setTimeout(()=>{
			this.gameGatewayService.deleteMyMatch(user.userid);
            this.log(`Timeover : Match is deleted`)
		}, 30000);
        return this.over("matchRequest")
	}

    @SubscribeMessage('backToGameRoom')
    async backToGameRoom(@ConnectedSocket() socket : AuthSocket, @MessageBody() payload1 : any) {
        this.log({gate : "backToGameRoom", ...payload1});
        let user : User;
        let payload;
        if (process.env.NODE_ENV === "dev") {
            user = await getCustomRepository(UserRepository).findOne({nickname : payload1.myNickname});
            payload = {
                roomid : (await getCustomRepository(GameRoomRepository).findOne({title : payload1.title})).roomid,
            }
        }
        else { //else if (process.env.NODE_ENV === "test") {
            //socket.user 접근
            user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
            payload = payload1;
        }
        const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such game Room");
            // throw new WsException("No such game room");
            return this.over("backToGameRoom");
        };
        //게임 종료? 진행중 ? 존재 하는지?멤버인지 등등 확인
        this.log(`${user.nickname} want to back to game room`);
        await this.gameGatewayService.backToGameRoom(user, game);
        return this.over("backToGameRoom");
    }
}