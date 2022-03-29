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

const ENV = dotenv.config();
export class GameGatewayService {
	private readonly logger = new Logger();

	private log(msg: String) {
		this.logger.log(msg, "GameGatewayService");
	}

	public async amIinGameRoom(user: User) {
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const res = await repo_gameMembership.amIinGameRoom(user);
		this.log(`Is ${user.nickname} in the gameRoom ? : ` + res);
		return res;
	}

	public async checkIfItIsAvailableRequest(user: User) {
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		if (await repo_gameMembership.findOne({ member: { userid: user.userid } }))
			return false;
		return true;
	}

	public async createMatchRoom(socket: AuthSocket, user: User) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const roomOptions = MatchingManager.generateGameRoomOptions();
		roomOptions['roomStatus'] = "creating";
		const requestId = await repo_gameRoom.createGameRoom(user, roomOptions);
		const game = new Game(requestId, roomOptions.speed);
		game.joinAsPlayer(socket.id, user);
		const gameRoom = await repo_gameRoom.findOne(requestId);
		await repo_gameMembership.joinGameRoomAs(user, gameRoom, 'owner'),
			onlineGameMap[requestId] = game;
		return requestId;
	}

	public async validateRequestStatus(requestid: string) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const request = await repo_gameRoom.findOne({ roomid: requestid });
		if (!request || request.roomStatus != "creating")
			return null;
		return request;
	}

	public async enterMatch(socket: AuthSocket, gameRoom: GameRoom, user: User) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const owner = gameRoom.owner;
		await Promise.all([
			repo_gameMembership.joinGameRoomAs(owner, gameRoom, 'owner'),
			repo_gameMembership.joinGameRoomAs(user, gameRoom, 'normal'),
			repo_gameRoom.update(gameRoom.roomid, { roomStatus: 'waiting' })
		]);
		const game = onlineGameMap[gameRoom.roomid];
		game.joinAsPlayer(socket.id, user);
		this.log(`${user.nickname} has joined the GameRoom ${gameRoom.title}`);
		let result = await this.getGameRoomInfo(gameRoom.roomid);
		return result;
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
		if (match)
			await repo_gameRoom.remove(match);
	}

	public async createAndEnterGameRoom(socket: AuthSocket, user: User, roomOptions: any) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const roomid = await repo_gameRoom.createGameRoom(user, roomOptions);
		const gameRoom = await repo_gameRoom.findOne(roomid);
		await repo_gameMembership.joinGameRoomAs(user, gameRoom, 'owner');
		let result = await this.getGameRoomInfo(gameRoom.roomid);
		this.log(`${user.nickname} has created the GameRoom ${result.title}`);


		const game = new Game(gameRoom.roomid, gameRoom.speed);
		game.joinAsPlayer(socket.id, user);
		onlineGameMap[gameRoom.roomid] = game;


		return result;
	}

	public async checkIfItIsAvailableToJoinAs(roomOptions: any) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const gameRoom = await repo_gameRoom.findOne(roomOptions.roomid);
		let position: GamePosition = roomOptions.isPlayer ? 'normal' : 'observer';
		if (!gameRoom) {
			this.log(`There is no such GameRoom`);
			return { result: false, gameRoom: null };
		}
		if (!await repo_gameRoom.isAvaliableToJoinAs(gameRoom, position, roomOptions.password)) {
			this.log(`It isn't available to join the GameRoom ${gameRoom.title} as ${position}`);
			return { result: false, gameRoom: null };
		}
		this.log(`It is available to join the GameRoom ${gameRoom.title} as ${position}`)
		return { result: true, gameRoom: gameRoom };
	}

	public async enterGameRoom(socketid: string, user: User, gameRoom: GameRoom, roomOptions: any) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		let position: GamePosition = roomOptions.isPlayer ? 'normal' : 'observer';
		await repo_gameMembership.joinGameRoomAs(user, gameRoom, position);
		let result = await repo_gameRoom.getRoomInfoWithMemberlist(gameRoom.roomid);
		this.log(`${user.nickname} has joined the GameRoom ${gameRoom.title} as ${position}`);


		const game = onlineGameMap[result.roomid];
		if (position === 'normal')
			game.joinAsPlayer(socketid, user); //add
		else
			game.joinAsObserver(socketid, user); //add
		return result;
	}

	public async isThisMyGameRoom(user: User, roomid: string) {
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const gameMembership = await repo_gameMembership.getMyRoom(user);
		return gameMembership.gameRoom.roomid === roomid;
	}

	public async exitGameRoom(socket: AuthSocket, user: User, roomid: string) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const gameRoom = await repo_gameRoom.findOne({ where: [{ roomid: roomid }], relations: ["members"] });
		if (!gameRoom) {
			this.log("No such game room");
			throw new WsException("No such game room");
		}
		const position = await repo_gameMembership.leaveGameRoom(user, gameRoom);
		this.log(`${user.nickname} left the GameRoom ${gameRoom.title}`);

		const game = onlineGameMap[gameRoom.roomid];
		game.leave(socket.id, user); //add
		if (this.shoulAuthorityBeDelegated(gameRoom, user)) {
			this.log(`The authority of ${gameRoom.title} should be delegated`);
			const newOwner = await this.delegateAuthority(gameRoom);
			if (!newOwner) {
				game.makeObserversLeave();
				this.deleteGameRoom(gameRoom);
			}
			game.changeGameRoom(socket.id, { manager: newOwner.userid });
		};
		if (await this.checkIfRoomShouldBeDeleted(gameRoom)) {
			game.makeObserversLeave();
			await this.deleteGameRoom(gameRoom);
		}
		return gameRoom;
	}

	public shoulAuthorityBeDelegated(gameRoom: GameRoom, user: User) {
		const isUserOwner = gameRoom.owner.userid === user.userid;
		let isThereOtherUser = false;
		gameRoom.members.map(function (membership) {
			if (membership.position === 'normal')
				isThereOtherUser = true;
		})
		if (isUserOwner && isThereOtherUser)
			return true;
		return false;
	}

	public async delegateAuthority(gameRoom: GameRoom) {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
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

	public async checkIfRoomShouldBeDeleted(gameRoom: GameRoom) {
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		if (!await repo_gameMembership.isTherePlayer(gameRoom)) {
			this.log(`Obs should leave the GameRoom & The GameRoom ${gameRoom.title} should be deleted`);
			return true;
		}
		else {
			this.log(`No need to delete the GameRoom ${gameRoom.title}`)
			return false;
		}

	}

	public async deleteGameRoom(gameRoom: GameRoom) {
		delete onlineGameMap[gameRoom.roomid]; //add
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		await repo_gameRoom.deleteGameRoom(gameRoom);
	}

	public async validationAuthority(user: User, roomid: string): Promise<boolean> {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const gameRoom = await repo_gameRoom.findOne({
			where: [{ roomid: roomid }],
			relations: ["owner"]
		})
		if (gameRoom.owner.userid === user.userid)
			return true;
		return false
	}

	public async checkIfItIsAvailableChangeOptions(roomid: string): Promise<boolean> {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const gameRoom = await repo_gameRoom.findOne(roomid);
		if (gameRoom.roomStatus === 'waiting') // check! : onlinegame 에서 확인 해도 되지 않을까? 
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

	public async getAllGameRoomList() {
		const repo_gameRoom = getCustomRepository(GameRoomRepository);
		const resultlist = [];
		const rawList = await repo_gameRoom.find();
		rawList.map(function (elem) {
			resultlist.push(repo_gameRoom.getRoomInfo(elem));
		})
		return resultlist;
	}

	public async getMyGameRoomList(user: User) {
		const repo_gameMembership = getCustomRepository(GameMembershipRepository);
		const gameMembership = await repo_gameMembership.getMyRoom(user);
		return gameMembership?.gameRoom;
	}

	public respondToUser(socket: AuthSocket, event: string, data: any) {
		socket.emit(event, data);
	}

	public whyCantCreate(payload: any) {
		if (payload.type === "private") {
			if (!payload?.password || payload.password === "")
				return "Prvate room should have a password"
		}
		if (!payload?.observer || payload.observer < 0 || payload.observer > 5)
			return "Wrong observer option"
		if (!payload?.speed)
			return "Wrong speed option";
		return "No reason";
	}

	public validateOptions(payload: any) {
		if (payload.type === "private") {
			if (!payload?.password || payload.password === "")
				return false;
		}
		if (!payload?.observer || payload.observer < 0 || payload.observer > 5)
			return false;
		if (!payload?.speed)
			return false;
		return true;
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

	public async validateMatchRequest(user: User, theOtherId: string) {
		const repo_blockList = getCustomRepository(BlockedFriendsRepository);
		const repo_user = getCustomRepository(UserRepository);
		const theOther = await repo_user.findOne(theOtherId);
		const result = await Promise.all([
			repo_blockList.amIBlockedBy(user, theOther),
			repo_blockList.didIBlock(user, theOther),
			!onlineManager.isOnline(theOtherId),
			this.amIinGameRoom(user),
			this.amIinGameRoom(theOther),
			user.userid === theOtherId
		]);
		if (result.findIndex(res => res === true) !== -1)
			return false;
		return true;
	}

	public async backToGameRoom(user: User, game: Game) {
		if (game.rightPlayer.id === user.userid) {
			game.rightPlayer.reset("right");
			game.rightPlayer.ready = true;
		}
		else if (game.leftPlayer.id === user.userid) {
			game.leftPlayer.reset("left");
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
				repo_gameMembership.leaveGameRoom(observerInfo.member, gameRoom);
			})
		}
	}

	async onlineMyGameRoom(socket: AuthSocket) {
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

	async offlineMyGameRoom(socket: AuthSocket) {
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
		game.offlineRoom(socket.id);
			
	}
}