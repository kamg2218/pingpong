import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { ChatRoom } from "./ChatRoom.entity";

@Entity()
export class ChatHistory {

    @PrimaryGeneratedColumn()
    index : number;

    @Column({ nullable : true })
    userid :string;

    @Column({ type: "timestamp" })
    createDate : Date;

    @Column({ type : "text" })
    contents : string;

    @ManyToOne(type => ChatRoom, chatroom => chatroom.history, {onDelete: `CASCADE`})
    @JoinColumn({ name : "chatid" })
    chatRoom: ChatRoom;

}