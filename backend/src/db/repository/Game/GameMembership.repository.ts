import { GameMembership, GameRoom } from "src/db/entity/Game/GameEntity";
import { User } from "src/db/entity/User/UserEntity";
import { GamePosition } from "src/type/MemberPosition.type";
import { EntityRepository, getCustomRepository, Repository } from "typeorm";
import { GameRoomRepository } from "./GameCustomRepository";

@EntityRepository(GameMembership)
export class GameMembershipRepository extends Repository<GameMembership> {

    async getMyRoom(user : User) {
        const room = await this.findOne({
            where : [{
                member : {userid : user.userid}
            }],
            relations : ["gameRoom"]
        })
        return room;
    }

    async joinGameRoomAs(member : User, gameRoom : GameRoom, position : GamePosition) {
        const repo_gameroom = getCustomRepository(GameRoomRepository);
        const newMember = this.create();
        newMember.gameRoom = gameRoom;
        newMember.member = member;
        newMember.position = position;
        await Promise.all([
            this.insert(newMember),
            repo_gameroom.increaseCount(gameRoom, position),
        ]);
    }

    async leaveGameRoom(member : User, gameRoom : GameRoom) {
        const repo_gameroom = getCustomRepository(GameRoomRepository);
        const membership = await this.findOne({member: {userid : member.userid}});
        console.log("userid : ", member.userid);
        console.log("membership : ", membership);
        await this.delete({member : {userid : member.userid}, gameRoom : gameRoom });
        await repo_gameroom.decreaseCount(gameRoom, membership.position);
        return membership.position;
    }

    async isTherePlayer(gameRoom : GameRoom) {
        const members = await this.find({where : [{gameRoom : {roomid : gameRoom.roomid}, position : 'normal'}, {gameRoom : {roomid : gameRoom.roomid}, position : 'owner'}]});
        if (members.length)
            return true;
        return false;
    }

    public async setPlayerAsNewOwner(gameRoom : GameRoom, indexNewOwner : number) {
        const repo_gameRoom = getCustomRepository(GameRoomRepository);
        await this.update(indexNewOwner, {position : 'owner'});
        const newOwner = (await this.findOne({where : [{index : indexNewOwner}], relations : ["member"]}));
        await repo_gameRoom.update(gameRoom.roomid, {owner : newOwner.member});
        return newOwner.member;
    }

    public async amIinGameRoom(user : User) : Promise<boolean> {
        const findResult = await this.find({member : {userid : user.userid}});
        if (findResult.length)
            return true;
        return false;
    }
}
    