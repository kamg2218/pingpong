import { BadRequestException, Res } from "@nestjs/common";
import { Friends } from "src/db/entity/User/Friends.entity";
import { User } from "src/db/entity/User/User.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(Friends)
export class FriendsRepository extends Repository<Friends> {

    async isMyFriend(me : User, other : User) : Promise<boolean> {
        const res = await this.find({where : [{requestFrom : me, requestTo : other}, {requestTo : me, requestFrom : other}]})
        if (!res)
            return false;
        else if (res && res.length === 1 && res[0].requestStatus === 'friend')
            return true;
        //else : 오류인데?
    }

    async didRequest(me : User, other : User) : Promise<boolean> {
        const result = await this.find({requestFrom : me, requestTo : other})
        if (result)
            return true;
        return false;
    }

    async requestFriend(from : User, to : User) {
        await this.insert({requestFrom : from, requestTo : to})
    }

    async deleteFriend(me : User, wasFriend : User) {
        const request = await this.find({where : [{requestFrom : me, requestTo : wasFriend}, {requestTo : me, requestFrom : wasFriend}]});
        if (request)
            this.remove(request);
    }

    async acceptFriendRequest(from : User, to : User) {
        this.update({requestFrom : from, requestTo : to}, {requestStatus : 'friend'});
    }

    async rejectFriendRequest(from : User, to : User) {
        const request = await this.find({requestFrom : from, requestTo : to});
        if (request)
            this.remove(request);
    }
}
