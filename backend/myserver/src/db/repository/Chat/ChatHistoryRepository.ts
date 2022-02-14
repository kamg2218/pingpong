import { ChatHistory } from "src/db/entity/Chat/ChatHistory.entity";
import { EntityRepository, Repository } from "typeorm";


@EntityRepository(ChatHistory)
export class ChatHistoryRepository extends Repository<ChatHistory> {

}