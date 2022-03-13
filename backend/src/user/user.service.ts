import { Injectable } from "@nestjs/common";
import { User } from "src/db/entity/User/UserEntity";
import { GameMembershipRepository } from "src/db/repository/Game/GameCustomRepository";
import { UserRepository } from "src/db/repository/User/UserCustomRepository";
import { getCustomRepository } from "typeorm";

@Injectable()
export class UserService {
    constructor(
    ) {}


    async findState(user: User) {
        let result;
        const gameRoom = await getCustomRepository(GameMembershipRepository).findOne({member: user});
        if (gameRoom !== undefined)
            result = "play";
        else
            result = "login";
        return result;
    }
}