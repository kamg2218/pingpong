import { BeforeRemove, CreateDateColumn,Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { ChatPosition } from "src/type/MemberPosition.type";
import { ChatRoom } from "./ChatRoom.entity";
import { User } from "../User/User.entity";

@Entity()
export class ChatMembership {

    @PrimaryGeneratedColumn()
    index : number;

    @Column({ default : "normal" })
    position : ChatPosition;

    @Column({ type: "timestamp", nullable : true })
    muteUntil : Date;

    @CreateDateColumn({ type: "timestamp" })
    enterDate : Date;

    @ManyToOne(type => ChatRoom, chatroom => chatroom.membership, { onDelete : "CASCADE" , eager : true})
    @JoinColumn({ name : "chatid" })
    chatroom: ChatRoom;

    @ManyToOne(type => User, user => user.member, { onDelete : "CASCADE", eager : true })
    @JoinColumn({ name : "userid" })
    member : User;
}