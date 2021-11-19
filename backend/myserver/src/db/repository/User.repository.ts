import { User } from "src/db/entity/User/User.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async getUserByNick(nickname : string) {
        //write
    }

    async doesExistNick(nickname : string) : Promise<boolean> {
        //write
        return false;
    }
    
    // admin으로 부터 밴되었는지 확인
    async didBanLogin(user : User) : Promise<boolean> {
        if (user.banLogin === true)
            return true;
        return false;
    }

    async didBanPublicChat(user : User) : Promise<boolean> {
        if (user.banPublicChat === true)
            return true;
        return false;
    }
    
    async switchToLogin(user : User) {
        await this.update(user.userid, {status : "login"});
    }
    
    async switchToLogout(user : User) {

        await this.update(user.userid, {status : "logout"});
    }
}