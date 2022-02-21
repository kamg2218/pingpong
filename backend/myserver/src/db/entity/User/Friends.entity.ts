import { RequestStatus } from "src/type/RequestStatus.type";
import {Entity, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn, BaseEntity} from "typeorm";
import { User } from "./User.entity";

@Entity()
export class Friends extends BaseEntity {

    @PrimaryGeneratedColumn()
    index : number;

    @ManyToOne((type)=>User, (user)=>user.friendsFrom, { onDelete : "CASCADE", eager : true})
    @JoinColumn({name : "requestFrom"})
    requestFrom : User;

    @ManyToOne((type)=>User, (user)=>user.friendsTo, { onDelete : "CASCADE", eager : true })
    @JoinColumn({name : "requestTo"})
    requestTo : User;

    @Column({default : "waiting"})
    requestStatus : RequestStatus;
}