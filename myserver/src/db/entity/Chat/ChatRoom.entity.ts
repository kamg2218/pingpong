import { RoomMode } from "src/type/RoomMode.type";
import { AfterInsert, AfterLoad, AfterUpdate, Column, Connection, Entity, getRepository, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatBanList } from "./ChatBanList.entity";
import { ChatHistory } from "./ChatHistory.entity";
import { ChatMemberShip } from "./ChatMembership.entity";

@Entity()
export class ChatRoom {

    @PrimaryGeneratedColumn('uuid')
    chatid : string;

    @Column()
    title : string;

    @Column()
    mode : RoomMode;

    @Column({ nullable : true })
    password : string;

    @Column({ default : 0 })
    memberCount : number;

    @OneToMany(type => ChatBanList, chatbanlist => chatbanlist.chatid, { cascade : true })
    banlists : ChatBanList[];

    @OneToMany(type => ChatHistory, chathistory => chathistory.chatid)
    history : ChatHistory[];

    @OneToMany(type => ChatMemberShip, chatmembership => chatmembership.chatroom, { cascade : true })
    membership : ChatMemberShip[];
}
