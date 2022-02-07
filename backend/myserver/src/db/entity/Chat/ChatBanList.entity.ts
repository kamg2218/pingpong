import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../User/User.entity";
import { ChatRoom } from "./ChatRoom.entity";

@Entity()
export class ChatBanList {

    @PrimaryGeneratedColumn()
    index : number;

    @ManyToOne(type => ChatRoom, chatroom => chatroom.banlists, { onDelete : "CASCADE" })
    @JoinColumn({ name : "chatid" })
    chatid: ChatRoom;

    @ManyToOne(type => User, user => user.banUser, { onDelete : "CASCADE" })
    @JoinColumn({ name : "userid" })
    userid : User;

}