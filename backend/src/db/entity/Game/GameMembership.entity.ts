import { GamePosition } from "src/type/MemberPosition.type";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameRoom } from "./GameRoom.entity";
import { User } from "../User/User.entity";

@Entity()
export class GameMembership extends BaseEntity {

    @PrimaryGeneratedColumn()
    index : number;

    @ManyToOne(type => GameRoom, room => room.members, { onDelete : "CASCADE" })
    @JoinColumn({name : "roomid"})
    gameRoom : GameRoom;

    @ManyToOne(type => User, user => user.gamerooms, { onDelete : "CASCADE" })
    member : User;

    @Column()
    position : GamePosition;
}