import { User } from "src/db/entity/User/User.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    constructor() {
        super()
    }
    
    createNotRegisteredUser(email : string) : User{
        const user = this.create();
        user.email = email;
        user.nickname = email;
        user.profile = -1;
        return user;
    }

    async register(userid : string, nickname : string, profile : number) {
        await this.update(userid, {nickname : nickname, profile : profile});
    }

    async getUserByNick(nickname : string) {
        //write
        const user = await this.findOne({nickname : nickname});
        return user;
    }

    async doesNickExist(nickname : string) : Promise<boolean> {
        const user = await this.findOne({nickname : nickname})
        return user ? true : false;
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
    
    async switchToLogin(user : User, refreshToken : string) {
        await this.update(user.userid, {status : "login", refreshToken : refreshToken});
    }
    
    async switchToLogout(user : User) {
        await this.update(user.userid, {status : "logout", refreshToken : null});
    }
}