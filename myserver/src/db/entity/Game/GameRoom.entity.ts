import { RoomStatus } from "src/type/RoomStatus.type";
import { Column, Entity, CreateDateColumn, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { RoomMode } from "../../../type/RoomMode.type";
import { GameRoomMembership } from "src/db/entity/Game/GameRoomMembership.entity";
import { User } from "../User/User.entity";

@Entity()
export class GameRoom {
    
    @PrimaryGeneratedColumn()
    roomid : string;

    @OneToMany(type => GameRoomMembership, member => member.roomid, { cascade : true })
    members : GameRoomMembership[];

    @Column()
    title : string;

    @Column()
    mode : RoomMode;

    @Column()
    map : string;

    @Column({ nullable : true })
    password : string;

    @Column({ default : "waiting" })
    roomStatus : RoomStatus;

    @OneToOne(type => User, { onDelete : "CASCADE" })
    @JoinColumn({ name : "owner" })
    owner : string;

    @Column()
    playerCount : number;

    @Column({ default : 0 })
    obsCount : number;

    @Column({ default : 5 })
    maxObsCount : number;

    @CreateDateColumn({ type : "timestamp" })
    createDate : Date;
}