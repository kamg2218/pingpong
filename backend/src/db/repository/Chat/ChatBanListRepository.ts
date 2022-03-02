import { ChatBanList } from "src/db/entity/Chat/ChatBanList.entity";
import { ChatRoom, ChatMembership } from "src/db/entity/Chat/ChatEntity";
import { User } from "src/db/entity/User/UserEntity";
import { EntityRepository, Repository } from "typeorm";


@EntityRepository(ChatBanList)
export class ChatBanListRepository extends Repository<ChatBanList> {

    async createBanUser(chatroom: ChatRoom, user: User) {
        let newBanUser = this.create();
        newBanUser.chatRoom = chatroom;
        newBanUser.user = user;
        await this.insert(newBanUser);
    }
}