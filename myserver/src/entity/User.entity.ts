
import {Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, CreateDateColumn, JoinColumn, OneToOne } from "typeorm";
import { ORIGIN } from 'src/Type/Origin.type';
import { Account } from "./Account.entity";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({unique : true})
    email: string;

    @Column({unique : true})
    nickname: string;

    @Column({type : 'simple-enum', enum: ORIGIN})
    origin : ORIGIN;

    @CreateDateColumn()
    createdate : Date;
}