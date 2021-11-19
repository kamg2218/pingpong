import {Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn} from "typeorm";
import { User } from "./User.entity";

@Entity()
export class BlockedFriends{

    @PrimaryGeneratedColumn()
    index : number;

    @ManyToOne((type)=>User, (user)=>user.blockFrom, { onDelete : "CASCADE" })
    @JoinColumn({name : "useridMy"})
    useridMy : User;

    @ManyToOne((type)=>User, (user)=>user.blockTo, { onDelete : "CASCADE" })
    @JoinColumn({name : "useridFriend"})
    useridBlock : User;
}