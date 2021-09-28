import {Entity, Column, PrimaryColumn, OneToOne} from "typeorm";
import { User } from "./User.entity";

@Entity()
export class Account {

    @PrimaryColumn()
    email : string;

    @Column()
    password : string;

    @OneToOne(()=>User, user => user.email, {onDelete : "CASCADE"})
    user:User
}