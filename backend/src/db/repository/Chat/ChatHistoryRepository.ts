import { ChatRoom, ChatHistory } from "src/db/entity/Chat/ChatEntity";
import { EntityRepository, getConnection, LessThan, Repository } from "typeorm";


@EntityRepository(ChatHistory)
export class ChatHistoryRepository extends Repository<ChatHistory> {
    async insertHistory(userid : string, payload : any, chatroom: ChatRoom) {
        let history = this.create();
        history.userid = userid;
        history.contents = payload.content;
        history.chatRoom = chatroom;
        history.createDate = payload.time;
        await this.insert(history);
        return history;
    }

    anonymise(userid : string, chatid : string) {
        this.update({userid : userid}, {chatRoom : {chatid : chatid}, userid : null});
    }

    async deleteAllHistory(chatid : string) {
        await this.delete({chatRoom : {chatid : chatid}});
    }

    // 시작점에서 히스토리 갯수만큼 가져오는거
    async bringHistory(lastPoint: number, chatid: string) {
        // 최신 순일경우 ,오래된 순일경우-> 상의하기
        let histoyList;
        if (lastPoint) {
            histoyList = await this.find({
                skip:0, take:3, 
                select:["index", "userid", "contents", "createDate"],
                where:[{chatRoom:{chatid: chatid}, index : LessThan(lastPoint)}],
                order : {"createDate" : "DESC"}
            }); 
        }
        else {
            histoyList = await this.find({
                skip:0, take:3, 
                select:["index", "userid", "contents", "createDate"],
                where:[{chatRoom:{chatid: chatid}}],
                order : {"createDate" : "DESC"}
            }); 
        }    
        return histoyList;

    }
    // 히스토리 내역을 정제하는거
    amugeona(histories : ChatHistory[]) {
        if (!histories.length) {
            return {lastIndex : -1, histories : []};
        }
        const lastIndex = histories[histories.length - 1].index;
        const reversed = histories.reverse();
        histories.map(history=>{
            delete history["index"];
        });
        return {lastIndex, histories : reversed};
    }
}