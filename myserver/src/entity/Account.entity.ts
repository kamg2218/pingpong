import {Entity, Column, PrimaryColumn, OneToOne, JoinColumn} from "typeorm";
import { User } from "./User.entity";

@Entity()
export class Account {

    @PrimaryColumn()
    email : string;

    @Column()
    password : string;
    
}