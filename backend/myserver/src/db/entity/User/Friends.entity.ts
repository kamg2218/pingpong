import { RequestStatus } from "src/type/RequestStatus.type";
import {Entity, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { User } from "./User.entity";

@Entity()
export class Friends{

    @PrimaryGeneratedColumn()
    index : number;

    @ManyToOne((type)=>User, (user)=>user.friendsFrom, { onDelete : "CASCADE" })
    @JoinColumn({name : "requestFrom"})
    requestFrom : User;

    @ManyToOne((type)=>User, (user)=>user.friendsTo, { onDelete : "CASCADE" })
    @JoinColumn({name : "requestTo"})
    requestTo : User;

    @Column({default : "waiting"})
    requestStatus : RequestStatus;
}