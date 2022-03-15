import { RoomStatus } from "src/type/RoomStatus.type";
import { Column, Entity, CreateDateColumn, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { RoomMode } from "../../../type/RoomMode.type";
import { GameMembership } from "src/db/entity/Game/GameMembership.entity";
import { User } from "../User/User.entity";

@Entity()
export class GameRoom {
    
    @PrimaryGeneratedColumn()
    roomid : string;

    @Column()
    title : string;

    @Column()
    type : RoomMode;

    @Column()
    speed : number;

    @Column({ nullable : true })
    password : string;

    @Column({ default : "waiting" })
    roomStatus : RoomStatus;

    @Column({ default : 0})
    playerCount : number;

    @Column({ default : 0 })
    obsCount : number;

    @Column({ default : 5 })
    maxObsCount : number;

    @CreateDateColumn({ type : "timestamp" })
    createDate : Date;

    @OneToOne(type => User, { onDelete : "CASCADE", eager : true })
    @JoinColumn({ name : "owner" })
    owner : User;

    @OneToMany(type => GameMembership, member => member.gameRoom, { cascade : true })
    members : GameMembership[];
}