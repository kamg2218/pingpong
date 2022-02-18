import { ChatRoom, ChatHistory } from "src/db/entity/Chat/ChatEntity";
import { EntityRepository, getConnection, Repository } from "typeorm";


@EntityRepository(ChatHistory)
export class ChatHistoryRepository extends Repository<ChatHistory> {
    insertHistory(userid : string, contents : string, chatroom: ChatRoom) {
        let history = this.create();
        history.userid = userid;
        history.contents = contents;
        history.chatRoom = chatroom;
        history.createDate = new Date();
        this.insert(history);
        return history;
    }

    anonymise(userid : string, chatid : string) {
        this.update({userid : userid}, {chatRoom : {chatid : chatid}, userid : null});
    }

    async deleteAllHistory(chatid : string) {
        await this.delete({chatRoom : {chatid : chatid}});
    }
}