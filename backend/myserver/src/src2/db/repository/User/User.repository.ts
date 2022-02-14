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

    async getUserById(userid : string) {
        const user = await this.findOne({userid : userid});
        return user;
    }

    getSimpleInfo(user : User, options? : string[]) : any {
        let res = {
            userid : user.userid, 
            nickname : user.nickname, 
            profile : user.profile};
        if (!options)
            return res;
        for (let value in options) {
            let option = options[value];
            if (option ===  "onoff")
                res[option] = this.isOnOrOff(user);
            else if (user?.[option] !== undefined)
                res[option] = user[option];
        }
        return res;
    }

    private isOnOrOff(user : User) {
        if (user.status === 'login')
            return true;
        else if (user.status === 'logout')
            return false;
        console.log("not register")
        return false;
    }
    async doesNickExist(nickname : string) : Promise<boolean> {
        const user = await this.findOne({nickname : nickname})
        return user ? true : false;
    }
    
    async updateLevelPoint(user : User, diff : number) {
        let newLevelpoint = user.levelpoint + diff;
        if (newLevelpoint < 0)
            newLevelpoint = 0;
        await this.update(user.userid, {
            levelpoint : newLevelpoint
        });
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
    
    async login(user : User, refreshToken : string) {
        await this.update(user.userid, {status : "login", refreshToken : refreshToken});
    }

    async logout(user : User) {
        await this.update(user.userid, {status : "logout", refreshToken : null});
    }
}