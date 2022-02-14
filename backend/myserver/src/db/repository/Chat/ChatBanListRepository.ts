import { ChatBanList } from "src/db/entity/Chat/ChatBanList.entity";
import { EntityRepository, Repository } from "typeorm";


@EntityRepository(ChatBanList)
export class ChatBanListRepository extends Repository<ChatBanList> {

}