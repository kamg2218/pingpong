import { RoomMode } from "src/type/RoomMode.type";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatBanList } from "./ChatBanList.entity";
import { ChatHistory } from "./ChatHistory.entity";
import { ChatMembership } from "./ChatMembership.entity";

@Entity()
export class ChatRoom extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    chatid : string;

    @Column()
    title : string;

    @Column()
    type : RoomMode;

    @Column({ nullable : true })
    password : string;

    @Column({ default : 0 })
    memberCount : number;

    @OneToMany(type => ChatBanList, chatbanlist => chatbanlist.chatRoom, { cascade : true })
    banlists : ChatBanList[];

    @OneToMany(type => ChatHistory, chathistory => chathistory.chatRoom, { cascade : true })
    history : ChatHistory[];

    @OneToMany(type => ChatMembership, ChatMembership => ChatMembership.chatroom, { cascade : true })
    membership : ChatMembership[];
}
