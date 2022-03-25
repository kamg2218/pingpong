import { Injectable } from "@nestjs/common";
import { User } from "src/db/entity/User/UserEntity";
import { GameMembershipRepository } from "src/db/repository/Game/GameCustomRepository";
import { UserRepository } from "src/db/repository/User/UserCustomRepository";
import { onlineGameMap } from "src/socketEvents/online/onlineGameMap";
import { getCustomRepository } from "typeorm";

@Injectable()
export class UserService {
    constructor(
    ) {}


    async findState(user: User) {
        let result;
        const gameMembership = await getCustomRepository(GameMembershipRepository).findOne({member: user});
        if (!gameMembership)
            result = "login";
        else {
            const game = onlineGameMap[gameMembership.gameRoom.roomid];
            if (game.start)
                result = "play";
            else
                result = "waiting"
        }
        return result;
    }
}