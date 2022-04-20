import { Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { hash } from "bcrypt";
import { GameRoom } from "src/db/entity/Game/GameEntity";
import { User } from "src/db/entity/User/UserEntity";
import { GameRoomRepository, GameMembershipRepository, GameHistoryRepository } from "src/db/repository/Game/GameCustomRepository";
import { BlockedFriendsRepository, UserRepository } from "src/db/repository/User/UserCustomRepository";
import { Game } from "src/socketEvents/game/gameElement/game";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { GamePosition } from "src/type/MemberPosition.type";
import { getCustomRepository } from "typeorm";
import { LevelManager } from "./gameElement/levelManager";
import { MatchingManager } from "../online/matchingManager";
import { onlineGameMap } from "../online/onlineGameMap";
import { onlineManager } from "../online/onlineManager";
import dotenv from 'dotenv'
import { ENV_PATH } from "src/config/url";
import { RoomStatus } from "src/type/RoomStatus.type";
import { randomInt } from "crypto";
import {GameMoveDTO, MatchResponseDTO, EnterGameRoomDTO, CreateGameRoomDTO, InviteGameRoomDTO } from './dto/game.dto'

const ENV = dotenv.config({path : ENV_PATH});

export class GameGatewayService {
	private readonly logger = new Logger();

	private log(msg: String) {
		this.logger.log(msg, "GameGatewayService");
	}

	public async amIinGameRoom(userid: string) {
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const res = await repo_gameMembership.amIinGameRoom(userid);
		return res;
	}

	public async checkIfItIsAvailableCreate(userid : string, payload : CreateGameRoomDTO) {
		const repo_user = getCustomRepository(UserRepository);
		const user = await repo_user.findOne(userid);
		let result = false;
		let reason = "";
		if (!user)
			reason = "No such user";
		else if (await this.amIinGameRoom(userid))
            reason = "You are already in the Game Room.";
		else if (payload.type === "private" && payload.password === "") {
			reason = "Prvate room should have a password";
		}
		else if (payload.observer < 0 || payload.observer > 5)
			reason = "Wrong observer option"
		else if (payload.speed < 0 || payload.speed > 3)
			reason = "Wrong speed option";
		else
			result = true;
		return {result, reason, user};
	}

	public async createAndEnterGameRoom(socketid: string, user: User, roomOptions: CreateGameRoomDTO) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		let gameRoomDefault
		let reason : string;
		let game : Game;
		try {
			gameRoomDefault = await repo_gameRoom.createGameRoom(user, roomOptions);
			game = new Game(gameRoomDefault.roomid, Number(roomOptions.speed));
			onlineGameMap[gameRoomDefault.roomid] = game;
		}
		catch (e) {
			reason = "Failed to create game room";
			return {result : false, reason};
		}
		try {
			await repo_gameMembership.joinGameRoomAs(user, gameRoomDefault.roomid, 'owner');
			let result = await this.getGameRoomInfo(gameRoomDefault.roomid);
			result['isPlayer'] = true;
			game.joinAsPlayer(socketid, user, result);
		}
		catch (e) {
			reason = "Failed to join room";
			repo_gameRoom.deleteGameRoom(gameRoomDefault);
			delete onlineGameMap[gameRoomDefault.roomid];
			return {result : false, reason};
		}
		return {result : true, reason};
	}

	public async checkIfItIsAvailableToJoin(userid : string, roomOptions : EnterGameRoomDTO) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_user = getCustomRepository(UserRepository);
		const user = await repo_user.findOne(userid);
		const gameRoom = await repo_gameRoom.findOne(roomOptions.roomid);
		let position: GamePosition = roomOptions.isPlayer ? 'normal' : 'observer';
		let result = false;
		let reason = "";
		try {
			if (!user)
				reason = "No such user";
			else if (!gameRoom)
				reason = "No such Game Room";
			else if (await this.amIinGameRoom(userid))
				reason = "You are already in the Game Room.";
			else if (! await repo_gameRoom.isAvaliableToJoinAs(gameRoom, position, roomOptions.password))
				reason = await repo_gameRoom.whyItIsntAvailableJoin(gameRoom, position, roomOptions.password);
			else
				result = true;
		}
		catch (e) {
			reason = "Something is wrong in checking validality";
			console.log(e);
		}
		return {result, reason, user, gameRoom};
	}

	public async getInviteRequestInfo(userid : string, roomid : string) {
		const repo_user = getCustomRepository(UserRepository);

		const user = await repo_user.findOne(userid);
		if (!user)
			return null;
		return {nickname : user.nickname, requestid : roomid};
	}

	public async enterGameRoom(socketid: string, user: User, gameRoom: GameRoom, roomOptions: any) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		let position: GamePosition = roomOptions.isPlayer ? 'normal' : 'observer';
		try {
			await repo_gameMembership.joinGameRoomAs(user, gameRoom.roomid, position);
		}
		catch (e) {
			return null;
		}
		let result = await repo_gameRoom.getRoomInfoWithMemberlist(gameRoom.roomid);
		result['isPlayer'] = roomOptions.isPlayer;
		const game = onlineGameMap[gameRoom.roomid];
		if (position === "observer" && !game.running)
			game.joinAsObserver(socketid, user, result);
		else if (position === "observer" && game.running) {
			const startInfo = await game.getInitialInfo();
			game.joinAsObserver(socketid, user, {...result, ...startInfo});
		}
		else
			game.joinAsPlayer(socketid, user, result);
		return gameRoom.roomid
	}

	public async checkIfItIsAvailableInvite(userid : string, payload : InviteGameRoomDTO) {
		let result = false;
		let reason = "";
		
		const repo_blockList = getCustomRepository(BlockedFriendsRepository);
		if (!await this.isThisMyGameRoom(userid, payload.roomid))
			reason = "You are not the member of the Game Room";
		else if (! onlineManager.isOnline(payload.userid))
			reason = "Friend is not online.";
		else if (await repo_blockList.amIBlockedById(userid, payload.userid))
			reason = "You are blocked."
		else if (await repo_blockList.didIBlockId(userid, payload.userid))
			reason = "You blocked."
		else {
			const res = await this.checkIfItIsAvailableToJoin(payload.userid, {roomid : payload.roomid, isPlayer : true, password : "*"});
			if (!res.result)
				reason = res.reason;
			else
				result = true;
		}
		return {result, reason};
	}

	public async getMyGameRoomInfoWithMemberList(roomid : string) {
		const repo_gameRoom =  getCustomRepository(GameRoomRepository)
		try {
			const roomInfo = await repo_gameRoom.getRoomInfoWithMemberlist(roomid);
			return roomInfo;
		}
		catch (e) {
			this.log("Something is wrong");
			console.log(e);
		}
		return null;
	}

	public async isThereGameRoomWithId(roomid : string) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const gameRoom = await repo_gameRoom.findOne(roomid);
		if (gameRoom)
			return true;
		return false;
	}

	public async checkIfItIsAvailableExit(userid : string, roomid : string) {
		if (! await this.isThereGameRoomWithId(roomid))
			return {result : false, reason : "No such Game Room."}
		else if (! await this.isThisMyGameRoom(userid, roomid))
			return {result : false, reason : "You are not in the Game Room."};
		return {result : true, reason : ""}
	}

	public async checkIfItIsAvailableRequest(userid: string, theOtherId : string) {
		const repo_blockList = getCustomRepository(BlockedFriendsRepository);
		const repo_user = getCustomRepository(UserRepository);
		const repo_gameRoom = getCustomRepository(GameRoomRepository);

		const theOther = await repo_user.findOne(theOtherId);
		const user = await repo_user.findOne(userid);
		if (!theOther)
			return {result : false, reason : "No such user", user : null}
		if (!onlineManager.isOnline(theOtherId))
			return {result : false, reason : "He/She is not online", user : null};
		const match = await repo_gameRoom.findOne({ owner: { userid: userid }, roomStatus: "creating" });
		if (match)
			return {result : false, reason : "You already requested", user : null};
		const res = await Promise.all([
			repo_blockList.amIBlockedBy(user, theOther),
			repo_blockList.didIBlock(user, theOther),
			this.amIinGameRoom(userid),
			this.amIinGameRoom(theOtherId),	
		]);
		if (res.findIndex(elem=>elem===true) != -1)
			return {result : false, reason : "Blocked/Block or Already in ther Game Room", user : null}
		return {result : true, reason : "", user}
	}

	public async createMatchRoom(user: User) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const roomOptions = MatchingManager.generateGameRoomOptions();
		roomOptions['roomStatus'] = "creating";
		const gameRoomDefault = await repo_gameRoom.createGameRoom(user, roomOptions);
		return {userid : user.userid, nickname : user.nickname, requestid : gameRoomDefault.roomid};
	}

	public async validateRequestStatus(requestid: string) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const request = await repo_gameRoom.findOne({ roomid: requestid });
		if (!request || request.roomStatus != "creating")
			return null;
		return request;
	}

	public async getGameRoomInfo(roomid: string) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		let result = await repo_gameRoom.getRoomInfoWithMemberlist(roomid);
		return result;
	}

	public async deleteMatch(request: GameRoom) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		await repo_gameRoom.remove(request);
	}

	public async deleteMyMatch(userid: string) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const match = await repo_gameRoom.findOne({ owner: { userid: userid }, roomStatus: "creating" });
		let result = true;
		if (match)
			await repo_gameRoom.remove(match);
		else
			result = false;
		return result;
	}

	public async checkIfItIsAvailableResponseMatchRQ(userid : string, payload : MatchResponseDTO) {
		const repo_user = getCustomRepository(UserRepository);
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		let result = false;
		let reason = "";
		const user = await repo_user.findOne(userid);
		const request = await repo_gameRoom.findOne({where : {roomid : payload.requestid}, relations : ["owner"]});
		try {
			if (!request)
				reason = "No such request."
			else if (await this.amIinGameRoom(userid))
				reason = "You are already in the Game Room"
			else if (!onlineManager.isOnline(request.owner.userid))
				reason = "Who sent request is not online now.";
			else
				result = true;
		}
		catch (e) {
			reason = "Something is wrong in checking validality";
		}
		return {result, reason, user, request};
	}

	public async isItrejected(payload : MatchResponseDTO, request : GameRoom) {
		if (payload.result === false)
			return true;
		if (await this.amIinGameRoom(request.owner.userid))
			return true;
		return false;
	}

	public rejectReqesut(request : GameRoom) {
		this.deleteMatch(request);
	}

	public async acceptRequest(gameRoom : GameRoom, user : User) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const theOther = gameRoom.owner;
		try {
			await repo_gameMembership.joinGameRoomAs(theOther, gameRoom.roomid, 'owner');
			await repo_gameMembership.joinGameRoomAs(user, gameRoom.roomid, 'normal');
			await repo_gameRoom.update(gameRoom.roomid, { roomStatus: 'waiting' });
		}
		catch (e) {
			this.log("Failed to join Game Room");
			return false;
		}
		try {
			const game = new Game(gameRoom.roomid, gameRoom.speed);
			onlineGameMap[gameRoom.roomid] = game;
			let roomInfo = await repo_gameRoom.getRoomInfoWithMemberlist(gameRoom.roomid);
			roomInfo['isPlayer'] = true;
			game.joinTwoPlayers(theOther, user, roomInfo);
		}
		catch (e) {
			this.log("Failed to create online game obj");
			delete onlineGameMap[gameRoom.roomid];
			return false;
		}
		return true;
	}

	public async isThisMyGameRoom(userid: string, roomid: string) {
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const gameMembership = await repo_gameMembership.getMyRoom(userid);
		if (!gameMembership)
			return false;
		return gameMembership.gameRoom.roomid === roomid;
	}
	
	public async exitGameRoom(socketid : string, userid : string, roomid : string) {
		const repo_user = getCustomRepository(UserRepository);
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const gameRoom = await repo_gameRoom.findOne({ where: [{ roomid: roomid }], relations: ["members"] });
		const user = await repo_user.findOne(userid);
		try {
			await repo_gameMembership.leaveGameRoom(userid, gameRoom);
		}
		catch (e) {
			this.log("Somethig is wrong.");
			return null;
		}
		const game = onlineGameMap[gameRoom.roomid];
		game.leave(socketid, user);
		if (this.shoulAuthorityBeDelegated(gameRoom, user)) {
			this.log(`The authority of ${gameRoom.title} should be delegated`);
			const newOwner = await this.delegateAuthority(gameRoom);
			game.changeGameRoom(socketid, { manager: newOwner.userid });
		};
		if (await this.checkIfRoomShouldBeDeleted(gameRoom)) {
			this.log(`Obs should leave the GameRoom & The GameRoom ${gameRoom.title} should be deleted`);
			await this.deleteGameRoom(gameRoom);
			await game.makeObserversLeave();
			delete onlineGameMap[gameRoom.roomid];
		}
		return roomid;
	}
	
	private shoulAuthorityBeDelegated(gameRoom: GameRoom, user: User) {
		const isOwner = gameRoom.owner.userid === user.userid;
		let isThereOtherUser = false;
		gameRoom.members.map(function (membership) {
			if (membership.position === 'normal')
				isThereOtherUser = true;
		})
		if (isOwner && isThereOtherUser)
			return true;
		return false;
	}

	private async delegateAuthority(gameRoom: GameRoom) {
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		let indexNewOwner;
		gameRoom.members.map(member => {
			if (member.position === 'normal')
				indexNewOwner = member.index;
		});
		const newOwner = await repo_gameMembership.setPlayerAsNewOwner(gameRoom, indexNewOwner);
		this.log(`The GameRoom ${gameRoom.title}'s new owner is ${newOwner.nickname}`);
		return newOwner;
	}

	private async checkIfRoomShouldBeDeleted(gameRoom: GameRoom) {
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		if (!await repo_gameMembership.isTherePlayer(gameRoom))
			return true;
		else
			return false;
	}

	private async deleteGameRoom(gameRoom: GameRoom) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		await repo_gameRoom.deleteGameRoom(gameRoom);
	}

	public async validationAuthority(userid: string, roomid: string) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const gameRoom = await repo_gameRoom.findOne({
			where: [{ roomid: roomid }],
			relations: ["owner"]
		})
		if (!gameRoom)
			return false;
		if (gameRoom.owner.userid !== userid)
			return false;
		return true;
	}

	public async checkIfItIsAvailableChangeOptions(roomid: string): Promise<boolean> {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const gameRoom = await repo_gameRoom.findOne(roomid);
		if (gameRoom.roomStatus === 'waiting')
			return true;
		return false;
	}

	public async changeGameRoomOptions(options: any) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const { roomid, title, password, speed, type } = options;
		const updateInfo = { title, password, speed, type };

		for (const key in updateInfo) {
			if (!updateInfo[key])
				delete updateInfo[key];
		};
		if (updateInfo.password)
			updateInfo["password"] = await hash(updateInfo.password, ENV.parsed.SALTROUND);
		await repo_gameRoom.update(roomid, updateInfo);

		const game = onlineGameMap[roomid];
		if (updateInfo?.speed)
			game.speed = updateInfo.speed;
		onlineGameMap[roomid].changeGameRoom(null, updateInfo); //add
	}

	public async checkIfItIsAvailableStartGame(userid : string, roomid : string) {
		let reason = "";
		let result = false;
		const game = onlineGameMap[roomid];
		if (!game)
			reason = "No such Game Room";
		else if (!await this.isThisMyGameRoom(userid, roomid))
			reason = "You are not the member of the Game Room"
        else if (!await this.validationAuthority(userid, roomid))
            reason = "You don't have authority to start game";
        else
			reason = game.whyCantStartGame();
		if (!reason)
			result = true;
		return {result, reason};
	}

	public async startGame(roomid : string) {
		const game = onlineGameMap[roomid];
		if (!game) {
			console.log("Something is wrong");
			return ;
		}
		let proxy = new Proxy(game, {
        	set : (target, prop, value) => {
            	target.over = true;
            	if (value)
              		this.recordGameHistory(game.id);
            	return true;
          	}
        });
        game.proxy = proxy;
        await this.switchGameRoomStatus(game.id, "running");
        await game.start();
	}

	public async movePlayers(userid : string, payload : GameMoveDTO) {
		const game = onlineGameMap[payload.roomid];
        if (!game) {
            this.log("No such gameRoom");
            return ;
        }
        game.chagnePlayersDirection(userid, payload.direction);
        return ;
	}

	public async getAllGameRoomList() {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const resultlist = [];
		const rawList = await repo_gameRoom.find({
			order : {
				createDate : "ASC"
			}
		});
		rawList.map(function (elem) {
			resultlist.push(repo_gameRoom.getRoomInfo(elem));
		})
		return resultlist;
	}

	public async recordGameHistory(gameid: string) {
		const repo_history = getCustomRepository(GameHistoryRepository);
		const repo_user = getCustomRepository(UserRepository);
		const game = onlineGameMap[gameid];
		if (!game.over)
			throw new WsException("The Game isn't over");
		const player1 = await repo_user.findOne({ userid: game.leftPlayer.id });
		const player2 = await repo_user.findOne({ userid: game.rightPlayer.id });
		let winner, loser;
		if (player1.userid === game.winner) {
			winner = player1;
			loser = player2;
		}
		else if (player2.userid === game.winner) {
			winner = player2;
			loser = player1;
		}
		await repo_history.saveHistory(player1, player2, winner, game.leftPlayer.score, game.rightPlayer.score, game.startTime, game.endTime);
		const { pwinner, ploser } = LevelManager.getPoint(LevelManager.level(winner.levelpoint), LevelManager.level(loser.levelpoint), game.speed);
		console.log(`winner : ${winner.userid}, loser : ${loser.userid}`);
		console.log(`pwinner : ${pwinner} ploser : ${ploser}`);
		await Promise.all([
			repo_user.updateLevelPoint(winner, pwinner),
			repo_user.updateLevelPoint(loser, ploser)
		]);
	}


	public async onlineMyGameRoom(socket: AuthSocket) {
		if (!socket.userid)
			return;
		const repo_gamemember = getCustomRepository(GameMembershipRepository);
		const myGamerom = await repo_gamemember.findOne({
			where : {member : {userid : socket.userid}},
			relations :["gameRoom"]
		});
		if (!myGamerom) {
			return ;
		}
		const game = onlineGameMap[myGamerom.gameRoom.roomid];
		game.onlineRoom(socket.id, socket.userid);
	}

	public async offlineMyGameRoom(socket: AuthSocket) {
		if (!socket.userid)
		return;
		const repo_gamemember = getCustomRepository(GameMembershipRepository);
		const myGamerom = await repo_gamemember.findOne({
			where : {member : {userid : socket.userid}},
			relations :["gameRoom"]
			});
		if (!myGamerom) {
			return ;
		}
		const game = onlineGameMap[myGamerom.gameRoom.roomid];
		if (game)
			game.offlineRoom(socket.id);
			
	}

	private async switchGameRoomStatus(roomid : string, roomStatus : RoomStatus) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		await repo_gameRoom.update({roomid : roomid}, {roomStatus : roomStatus});
	}

	public async enterExistingGameRoom(socketid : string, userid : string) {
		const repo_user = getCustomRepository(UserRepository);
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const user = await repo_user.findOne(userid);
		let lists = await repo_gameRoom.getWaitingGameRoom();
		let reason = "";
		let isEntered = false;
		if (await this.amIinGameRoom(userid)) {
			reason = "You are already in the game room";
		}
		else if (lists.length) {
			let history = [];
			let randomizedIndex = MatchingManager.getRandomInt(0, lists.length);
			history.push(lists[randomizedIndex].roomid);
			let res = await this.checkIfItIsAvailableToJoin(userid, {roomid : lists[randomizedIndex].roomid, isPlayer : true});
			while (!res.result) {
				if (history.length === lists.length)
					break;
				while (history.findIndex(elem=>elem === lists[randomizedIndex].roomid) !== -1)
					randomizedIndex = MatchingManager.getRandomInt(0, lists.length);
				history.push(lists[randomizedIndex].roomid);
				res = await this.checkIfItIsAvailableToJoin(userid, {roomid : lists[randomizedIndex].roomid, isPlayer : true});
			}
			if (res.result) {
				const roomid = await this.enterGameRoom(socketid, user, res.gameRoom, {isPlayer : true});
				if (roomid)
					isEntered = true;
			}
		}
		return {reason, isEntered};
	}

	public async enterExsitingMatch(userid : string) {
		const repo_user = getCustomRepository(UserRepository);
		const user = await repo_user.findOne(userid);
		let isEntered = false;
		if (await this.amIinGameRoom(userid))
			return {reason : "You are already in the Game Room", isEntered};
		if (!MatchingManager.isThereWaitingUser())
			return {reason : "", isEntered};
		const theOtherId = MatchingManager.getOne();
		const theOther = await repo_user.findOne({userid : theOtherId});
		if (await this.amIinGameRoom(theOtherId))
			return {reason : "", isEntered};
		let gameRoom = this.createEmptyRoom();
		let enterResult = await this.enterEmptyGameRoom(gameRoom, user, theOther);
		if (!enterResult)
			return {reason : "Something wrong", isEntered};
		isEntered = true;
		return {isEntered, reason : ""};

	}

	public createEmptyRoom() {
        const repo_gameRoom = getCustomRepository(GameRoomRepository);
        const options = MatchingManager.generateGameRoomOptions();
        let gameRoom = repo_gameRoom.create();
        for (let option in options)
            gameRoom[option] = options[option];
        return gameRoom;
    }

	public putOntheList(userid : string) {
		MatchingManager.putOnTheWaitingList(userid);
	}

	public async enterEmptyGameRoom(gameRoom : GameRoom, user : User, theOther : User) {
		console.log("Enter empty gameROom");
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		let game : Game;
		let random = randomInt(1);
		let owner = random ? user : theOther;
		let normal = random ? theOther : user;
		gameRoom.owner = owner;
		let roomid;
		try {
			let insertResult = await repo_gameRoom.insert(gameRoom);
			roomid = insertResult.identifiers[0].roomid;
			game = new Game(gameRoom.roomid, gameRoom.speed);
			onlineGameMap[gameRoom.roomid] = game;
		}
		catch(e) {
			this.log("Failed to create Game Room");
			return false;
		}
		gameRoom = await repo_gameRoom.findOne(roomid);
		try {
			await repo_gameMembership.joinGameRoomAs(owner, gameRoom.roomid, "owner");
			await repo_gameMembership.joinGameRoomAs(normal, gameRoom.roomid, "normal");
		}
		catch (e) {
			this.log("Failed to join Game Room");
			await repo_gameRoom.deleteGameRoom(gameRoom);
			return false;
		}
		try {
			let roomInfo = await repo_gameRoom.getRoomInfoWithMemberlist(gameRoom.roomid);
			roomInfo['isPlayer'] = true;
			onlineGameMap[gameRoom.roomid];
			game.joinTwoPlayers(user, theOther, roomInfo);
		}
		catch (e) {
			this.log("Failed to create online game obj");
			delete onlineGameMap[gameRoom.roomid];
			return false;
		}
		return true;
	}

	/*
	public async backToGameRoom(user: User, game: Game) {
		if (game.rightPlayer.id === user.userid) {
			game.rightPlayer.reset("right", game.speed);
			game.rightPlayer.ready = true;
		}
		else if (game.leftPlayer.id === user.userid) {
			game.leftPlayer.reset("left", game.speed);
			game.leftPlayer.ready = true;

		}
		if (game.rightPlayer.ready && game.leftPlayer.ready) {
			const repo_gameRoom = getCustomRepository(GameRoomRepository);
			const repo_gameMembership = getCustomRepository(GameMembershipRepository);
			const gameRoom = await repo_gameRoom.findOne(game.id);
			game.makeObserversLeave();
			const observersList = await repo_gameMembership.find({
				where: [{ gameRoom: { roomid: gameRoom.roomid }, position: "observer" }],
				relations: ["member"]
			});
			observersList.map(async (observerInfo) => {
				repo_gameMembership.leaveGameRoom(observerInfo.member.userid, gameRoom);
			})
		}
	}
	*/
}