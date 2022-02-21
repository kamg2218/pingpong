import {Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, BaseEntity} from "typeorm";
import { User } from "./User.entity";

@Entity()
export class BlockedFriends extends BaseEntity {

    @PrimaryGeneratedColumn()
    index : number;

    @ManyToOne((type)=>User, (user)=>user.blockFrom, { onDelete : "CASCADE", eager : true })
    @JoinColumn({name : "useridMy"})
    me : User;

    @ManyToOne((type)=>User, (user)=>user.blockTo, { onDelete : "CASCADE", eager : true })
    @JoinColumn({name : "useridFriend"})
    block : User;
}