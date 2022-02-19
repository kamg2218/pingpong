import { Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { User, Friends, BlockedFriends } from "src/db/entity/User/UserEntity";
import { UserRepository, FriendsRepository, BlockedFriendsRepository } from "src/db/repository/User/UserCustomRepository";
import { GameHistoryRepository } from "src/db/repository/Game/GameCustomRepository";
import { getCustomRepository } from "typeorm";
import { LevelManager } from "./gameElement/levelManager";

export class UserGatewayService {
    private readonly logger = new Logger();  
  // constructor(
  //     private readonly logger : Logger,
  //   ) {
  //   }

    public arrOfObjToObj(values : Array<object>) : Object {
      let obj = {};
      values.map((value)=>(Object.assign(obj, value)));
      return obj;
    }
    
    public async getUserInfo(user : User) {
      const repo_user = getCustomRepository(UserRepository);
      const userInfo = repo_user.getSimpleInfo(user, ["levelpoint"]);
      const levelnextpoint = LevelManager.nextLevelPoint(userInfo.levelpoint);
      const level = LevelManager.level(userInfo.levelpoint);
      return {...userInfo, levelnextpoint, level};
    }

    public async getTheOtherUSerInfo(me : User, theOther : User) {
      const repo_user = getCustomRepository(UserRepository);
      const repo_friend = getCustomRepository(FriendsRepository);
      const repo_block = getCustomRepository(BlockedFriendsRepository);
      const userInfo = repo_user.getSimpleInfo(theOther, ["level"]);
      return {
        ...userInfo,
        friend : await repo_friend.isMyFriend(me, theOther),
        block : await repo_block.didIBlock(me, theOther),
      }
    }

    public async getFriendsInfo(user : User) {
      const repo_friend = getCustomRepository(FriendsRepository);
      const repo_user = getCustomRepository(UserRepository);
      const lists = await repo_friend.friends(user);
      const res = [];
      lists.map(function(friendinfo : Friends) {
        let friend = friendinfo.requestFrom.userid !== user.userid ? friendinfo.requestFrom : friendinfo.requestTo; 
        let infovalue = repo_user.getSimpleInfo(friend, ['onoff']);
        res.push(infovalue);
      });
      return {friends : res}
    }

    private calculateWinLose(lists, myUserid : string) {
      let win = 0;
      let lose = 0;
      lists.map(function(one) {
        if (one.winner === myUserid)
          win++;
        else
          lose++;
      });
      return {win, lose};
    }

    public async getGamehistory(user : User) {
      const repo_history = getCustomRepository(GameHistoryRepository);
      const lists = await repo_history.getAllHistories(user);
      const {win, lose} = this.calculateWinLose(lists, user.userid);
      return {history : lists, win, lose};
    }

    public async getBlocklist(user : User) {
      const repo_block = getCustomRepository(BlockedFriendsRepository);
      const repo_user = getCustomRepository(UserRepository);
      const lists = await repo_block.getBlocklists(user);
      const res = [];
      lists.map(function(blockinfo : BlockedFriends) {
        let infovalue = repo_user.getSimpleInfo(blockinfo.block);
        res.push(infovalue);
      });
      return {blacklist : res};
    }

    public async getFriendRequest(user : User) {
      const repo_friend = getCustomRepository(FriendsRepository);
      const repo_user = getCustomRepository(UserRepository);
      const lists = await repo_friend.receivedFriendRequest(user);
      const res = [];
      lists.map(function(requestInfo : Friends) {
        let infovalue = repo_user.getSimpleInfo(requestInfo.requestFrom);
        res.push(infovalue);
      })
      return {newfriends : res};
    }

    public async block(user : User, theOtherUserid : string) {    
      /* temp */
      /* change : nickanme -> theOtherUserid */
      const theOther = await getCustomRepository(UserRepository).findOne(theOtherUserid); 
      /*-----*/
      const repo_block = getCustomRepository(BlockedFriendsRepository);
      const repo_friend = getCustomRepository(FriendsRepository);
      if (!theOther) {
        this.logger.log("no such user", "UserGatewayService");
        throw new WsException("Bad Request");
      }
      if (await repo_block.didIBlock(user, theOther)) {
        this.logger.log(`You already blocked ${theOther.nickname}`, "UserGatewayService");
        throw new WsException(`You already blocked ${theOther.nickname}`);
      }
      await Promise.all([
          repo_friend.cancleSentFriendRequest(user, theOther),
          repo_friend.rejectFriendRequest(user, theOther),
          repo_friend.deleteFriendRelation(user, theOther),
      ]);
      await repo_block.block(user, theOther);
      this.logger.log(`${user.nickname} blocked ${theOther.nickname}`, "UserGatewayService");
    }

    public async unblock(user : User, theOtherUserid : string) {
      /* temp */
      /* change : nickanme -> theOtherUserid */
      const theOther = await getCustomRepository(UserRepository).findOne(theOtherUserid); 
      /*-----*/
      const repo_block = getCustomRepository(BlockedFriendsRepository);
      if (!theOther) {
        this.logger.log("no such user", "UserGatewayService")
        throw new WsException("Bad Request");
      }  
      if (!await repo_block.didIBlock(user, theOther)) {
        this.logger.log(`You didn't block ${theOther.nickname}`, "UserGatewayService");
        throw new WsException(`You didn't block ${theOther.nickname}`);
      }
      await repo_block.unblock(user, theOther);
      this.logger.log(`${user.nickname} unblocked ${theOther.nickname}`, "UserGatewayService");
    }

    public async sendFriendRequest(user : User, theOtherUserid : string) {
      /* temp */
      /* change : nickanme -> theOtherUserid */
      const friend = await getCustomRepository(UserRepository).findOne(theOtherUserid); 
      /*-----*/
      const repo_block = getCustomRepository(BlockedFriendsRepository);
      const repo_friend = getCustomRepository(FriendsRepository);
      if (!friend) {
        this.logger.log("no such user", "UserGatewayService");
        throw new WsException("Bad Request");
      }  
      if (await repo_friend.isMyFriend(user, friend)) {
          this.logger.log("already friend", "UserGatewayService");
          throw new WsException(`You are already friend with ${friend.nickname}`)
      }
      if (await repo_block.amIBlockedBy(user, friend)) {
          this.logger.log("you are blocked", "UserGatewayService");
          throw new WsException(`You are blocked by ${friend.nickname}`);
      }  
      if (await repo_block.didIBlock(user, friend)) {
           this.logger.log("You blocked", "UserGatewayService");
          throw new WsException(`You blocked ${friend.nickname}`);
      }
      if (await repo_friend.didISendRequest(friend, user)) {
        await repo_friend.acceptFriendRequest(friend, user);
        this.logger.log(`${user.nickname} accepted a friendRequest from ${friend.nickname}`, "UserGatewayService");
      }
      else {
        await repo_friend.sendFriendRequest(user, friend);
        this.logger.log(`${user.nickname} sent a friendRequest to ${friend.nickname}`, "UserGatewayService");
      }
    }

    public async deleteFriend(user : User, theOtherUserid : string) {
      /* temp */
      /* change : nickanme -> theOtherUserid */
      const friend = await getCustomRepository(UserRepository).findOne(theOtherUserid); 
      /*-----*/
      const repo_friend = getCustomRepository(FriendsRepository);
      if (!friend) {
        this.logger.log("no such user");
        throw new WsException("Bad Request");
      }  
      if (await repo_friend.isNotMyFriend(user, friend)) {
        this.logger.log(`You are not friend of ${friend.nickname}`, "UserGatewayService");
        throw new WsException(`You are not friend of ${friend.nickname}`);
      }
      await repo_friend.deleteFriendRelation(user, friend);
      this.logger.log(`${user.nickname} deleted ${friend.nickname} from friend lists`, "UserGatewayService");
    }

    public async resepondToFriendRequest(user : User, theOtherUserid : string, respond : boolean) {
      /* temp */
      /* change : nickanme -> theOtherUserid */
      const theOther = await getCustomRepository(UserRepository).findOne(theOtherUserid); 
      /*-----*/
      const repo_friend = getCustomRepository(FriendsRepository);
      const repo_user = getCustomRepository(UserRepository);
      if (!theOther) {
        this.logger.log("no such user", "UserGatewayService");
        throw new WsException("Bad Request");
      }
      if (!await repo_friend.didISendRequest(theOther, user)) {
        this.logger.log("no such request", "UserGatewayService");
        throw new WsException("Bad Request");
      }
      if (respond === true) {
        await repo_friend.acceptFriendRequest(theOther, user);
        this.logger.log(`${user.nickname} accepted friendRequest from ${theOther.nickname}`, "UserGatewayService");
      }
        
      else {
        await repo_friend.rejectFriendRequest(theOther, user);
        this.logger.log(`${user.nickname} rejected friendRequest from ${theOther.nickname}`, "UserGatewayService");
      }
      return {
        isAccepted : respond,
        myInfo : repo_user.getSimpleInfo(user, ['onoff']),
        theOtherInfo : repo_user.getSimpleInfo(theOther, ['onoff']),
      };
    }

    async update(user : User, newOptions : any) {
      const repo_user = getCustomRepository(UserRepository);
      const {nickname, profile} = newOptions;
      if (nickname && profile) {
        await repo_user.update(user.userid, {nickname : nickname, profile : profile});
        this.logger.log(`${user.nickname} has changed nickname & profile`, "UserGatewayService");
        return {nickname : true, profile : true};
      }
      else if (nickname) {
        await repo_user.update(user.userid, {nickname : nickname});
        this.logger.log(`${user.nickname} has changed nickname`, "UserGatewayService");
        return {nickname : true};
      }
      else if (profile) {
        await repo_user.update(user.userid, {profile : profile});
        this.logger.log(`${user.nickname} has changed profile`, "UserGatewayService");
        return {profile : true};
      }

    }
}