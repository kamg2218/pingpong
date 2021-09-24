import {Entity, Column, PrimaryColumn} from "typeorm";

@Entity()
export class Account {

    @PrimaryColumn()
    email : string;

    @Column()
    password : string;
}