import { EntityRepository, Repository } from "typeorm";
import { User, BlockedFriends } from "../../entity/User/UserEntity";

@EntityRepository(BlockedFriends)
export class BlockedFriendsRepository extends Repository<BlockedFriends> {
    
    async amIBlockedByid(me: User, theOtherid : string) : Promise<boolean> {
        const list = await this.find({me : {userid : theOtherid} , block : me});
        if (list.length)
            return true;
        return false;
    }

    async amIBlockedBy(me : User, theOther : User) : Promise<boolean> {
        const list = await this.find({me : theOther, block : me});
        if (list.length)
            return true;
        return false;
    }

    async didIBlock(me : User, theOther : User) : Promise<boolean> {
        const list = await this.find({me : me, block : theOther});
        if (list.length)
            return true;
        return false;
    }

    async block(me : User, theOther : User) {
        const blocklist = this.create();
        blocklist.me = me;
        blocklist.block = theOther;
        await this.insert(blocklist);
    }

    async unblock(me : User, theOther : User) {
        await this.delete({me : me, block : theOther});
    }

    async getBlocklists(me : User) {
        return await this.find({me : me});
    }
}