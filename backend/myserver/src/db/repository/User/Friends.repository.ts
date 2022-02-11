import { Friends } from "src/db/entity/User/Friends.entity";
import { User } from "src/db/entity/User/User.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(Friends)
export class FriendsRepository extends Repository<Friends> {

    async isMyFriend(me : User, other : User) : Promise<boolean> {
        const res = await this.find({where : [{requestFrom : me, requestTo : other, requestStatus : 'friend'}, {requestTo : me, requestFrom : other, requestStatus : 'friend'}]});
        if (!res.length)
            return false;
        return true;
    }

    async didISendRequest(me : User, theOther : User) : Promise<boolean> {
        const result : Friends[] = await this.find({requestFrom : me, requestTo : theOther})
        if (result.length)
            return true;
        return false;
    }

    async sendFriendRequest(me : User, theOther : User) {
        if (await this.didISendRequest(me, theOther))
            return ;
        await this.insert({requestFrom : me, requestTo : theOther})
    }

    async friends(me : User) {
        return await this.find({where : [{requestFrom : me, requestStatus : "friend"}, {requestTo : me, requestStatus : "friend"}]});
    }
    
    async receivedFriendRequest(me : User, theOther? : User) {
        const res = theOther ? this.find({requestTo : me, requestFrom : theOther, requestStatus : 'waiting'}) : this.find({requestTo : me, requestStatus : 'waiting'});
        return res;
    }

    async cancleSentFriendRequest(me : User, theOther : User) {
        await this.delete({ requestFrom : me, requestTo : theOther, requestStatus : 'waiting'})
    }

    async deleteFriendRelation(me : User, theOther : User) {
        const request = await this.find({where : [{requestFrom : me, requestTo : theOther}, {requestTo : me, requestFrom : theOther}]});
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
