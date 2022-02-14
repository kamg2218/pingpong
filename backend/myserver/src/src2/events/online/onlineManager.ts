import { User } from "src/db/entity/User/UserEntity";
import { FriendsRepository, UserRepository } from "src/db/repository/User/UserCustomRepository";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { getCustomRepository } from "typeorm";

const onlineMap = {};

export const onlineManager = {
    
	print() {
		console.log("online : ", onlineMap);
	},

	userIdOf(socketid : string) {
		const nsp = "/";
		let list = onlineMap[nsp];
		let userid;
		for (let key in list) {
			if (list[key] === socketid) {
				userid = key;
				break;
			}
		}
		return userid;
	},

	socketIdOf(userid : string) {
		const nsp = "/"
		return onlineMap[nsp][userid];
	},

	isOnline(userid : string) {
		return onlineMap["/"].hasOwnProperty(userid);
	},

	async online(socket : AuthSocket, payload : any) {
        if (!onlineMap[socket.nsp.name]) {
            onlineMap[socket.nsp.name] = {};
        }
        const repo_user = getCustomRepository(UserRepository);
        const user = await repo_user.findOne({nickname : payload.myNickname}); //temp
        onlineMap[socket.nsp.name][user.userid] = socket.id;
    },

	offline(socket : AuthSocket) {
		for (let key in onlineMap[socket.nsp.name]) {
			if (onlineMap[socket.nsp.name][key] === socket.id) {
			delete onlineMap[socket.nsp.name][key];
			break;
			}
		}
	},

	async onlineFriends(socket : AuthSocket, user : User) {
		const repo_friend = getCustomRepository(FriendsRepository);
		const friends = await repo_friend.friends(user);
		let res = {}
		friends.map(relations=>{
			let friend = relations.requestFrom.userid === user.userid ? relations.requestTo : relations.requestFrom;
			let friendSocketId = this.socketIdOf(friend.userid);
			if (friendSocketId)
				res[friendSocketId] = friend;
		});
		return res;
	}
}