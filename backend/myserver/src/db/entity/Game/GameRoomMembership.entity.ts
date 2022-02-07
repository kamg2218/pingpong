import { Position } from "src/type/MemberPosition.type";
import { GameLocation } from "src/type/GameLocation.type";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameRoom } from "./GameRoom.entity";
import { User } from "../User/User.entity";

@Entity()
export class GameRoomMembership {

    @PrimaryGeneratedColumn()
    index : number;

    @ManyToOne(type => GameRoom, room => room.members, { onDelete : "CASCADE" })
    @JoinColumn({name : "roomid"})
    roomid : GameRoom;

    @ManyToOne(type => User, user => user.gamerooms, { onDelete : "CASCADE" })
    userid : User;

    @Column()
    position : Position;

    @Column({ default : "stanby" })
    location : GameLocation;
}