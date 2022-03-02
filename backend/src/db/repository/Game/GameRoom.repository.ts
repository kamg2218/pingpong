import { WsException } from "@nestjs/websockets";
import { GameRoom } from "src/db/entity/Game/GameEntity";
import { User } from "src/db/entity/User/UserEntity";
import { GamePosition } from "src/type/MemberPosition.type";
import { EntityRepository, getCustomRepository, Repository } from "typeorm";
import { UserRepository } from "../User/User.repository";
import { GameMembershipRepository } from "./GameCustomRepository";
import {hash, compare} from 'bcrypt'
import { SALTROUND } from "src/config/const";
@EntityRepository(GameRoom)
export class GameRoomRepository extends Repository<GameRoom> {
    

    public async getRoomInfoWithMemberlist(roomid : string) {
        const repo_gameMembership = getCustomRepository(GameMembershipRepository);
        const repo_user = getCustomRepository(UserRepository);
        const gameRoom = await this.findOne({roomid});
        const membershiplist = await repo_gameMembership.find({where : [{gameRoom : gameRoom}], relations : ["member"]});
        let roomSimpleInfo = this.getSimpleRoomInfo(gameRoom);
        let observer = [];
        let players = [];
        membershiplist.map(function(membership){
            if (membership.position === 'observer')
                observer.push(repo_user.getSimpleInfo(membership.member));
            else
                players.push(repo_user.getSimpleInfo(membership.member)); 
        })
        return {
            ...roomSimpleInfo,
            observer,
            players
        }
    }

    public getRoomInfo(gameRoom : GameRoom) {
        const {roomid, title, speed, owner, roomStatus, obsCount, playerCount, maxObsCount} = gameRoom;
        let status = roomStatus === 'waiting' ? false : true;
        let manager = owner.userid;
        let password = gameRoom.password ? true : false;
        return {
            roomid, title, speed,
            status, manager, password,
            player : playerCount,
            observer : obsCount,
            maxObserver : maxObsCount,
        }
    }

    public getSimpleRoomInfo(gameRoom : GameRoom) {
        const {roomid, title, speed, owner, roomStatus} = gameRoom;
        let status = roomStatus === 'waiting' ? false : true;
        let manager = owner.userid;
        return {roomid, title, speed, manager, status};
    }

    public async getWaitingGameRoom() {
        return await this.find({roomStatus : 'waiting', type : "public", playerCount : 1});
    }

    public async createGameRoom(owner : User, roomOption : any) {
        const newRoom = this.create();
        newRoom.owner = owner;
        for (let key in roomOption) {
            if (key === "observer")
                newRoom["maxObsCount"] = roomOption[key];
            else if (key === "password")
                newRoom[key] = await hash(roomOption[key], SALTROUND);
            else
                newRoom[key] = roomOption[key];
        }
        const insertResult = await this.insert(newRoom);
        return insertResult.identifiers[0].roomid;
    }

    public async increaseCount(gameRoom : GameRoom, position : GamePosition) {
        if (position === 'observer')
            await this.increaseObsCount(gameRoom);
        else if (position === "normal" || position === "owner")
            await this.increasePlayerCount(gameRoom);
    }

    public async decreaseCount(gameRoom : GameRoom, position : GamePosition) {
        if (position === 'observer')
            await this.decreaseObsCount(gameRoom);
        else if (position === "normal" || position === "owner")
            await this.decreasePlayerCount(gameRoom);
    }

    private async increasePlayerCount(gameRoom : GameRoom) {
        if (gameRoom.playerCount >= 2)
            throw new WsException("GameRoom is full");
        const newPlayerCount = gameRoom.playerCount + 1;
        const x = await this.update(gameRoom.roomid, {playerCount : newPlayerCount});
    }

    private async decreasePlayerCount(gameRoom : GameRoom) {
        if (gameRoom.playerCount <= 0)
            throw new WsException("There is no member in gameRoom");
        const newPlayerCount = gameRoom.playerCount - 1;
        await this.update(gameRoom.roomid, {playerCount : newPlayerCount});
    }

    private async increaseObsCount(gameRoom : GameRoom) {
        if (gameRoom.obsCount >= gameRoom.maxObsCount)
            throw new WsException("GameRoom is full");
        const newObsCount = gameRoom.obsCount + 1;
        await this.update(gameRoom.roomid, {obsCount : newObsCount});
    }

    private async decreaseObsCount(gameRoom : GameRoom) {
        if (gameRoom.obsCount <= 0)
            throw new WsException("There is no observer in gameRoom")
        const newObsCount = gameRoom.obsCount - 1;
        await this.update(gameRoom.roomid, {obsCount : newObsCount});
    }

    async deleteGameRoom(gameRoom : GameRoom) {
        await this.remove(gameRoom);
    }

    private checkPlayerCount(gameRoom : GameRoom) {
        if (gameRoom.playerCount >= 2)
            return false;
        return true;
    }

    private checkObserverCount(gameRoom : GameRoom) {
        if (gameRoom.obsCount >= gameRoom.maxObsCount)
            return false;
        return true;
    }

    public async isAvaliableToJoinAs(gameRoom : GameRoom, position : GamePosition, password : string) {
        const checker = {
            'normal' : this.checkPlayerCount,
            'observer' : this.checkObserverCount,
        }
        if (!checker[position](gameRoom))
            return false;
        if (gameRoom.password && !await compare(password, gameRoom.password))
            return false;
        if (gameRoom.roomStatus !== 'waiting')
            return false;
        return true;
    }
}
    