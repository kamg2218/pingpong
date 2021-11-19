import { Column, CreateDateColumn, Entity, getRepository, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class WaitingSignup {
    @PrimaryGeneratedColumn('uuid')
    emailid : string

    @Column({unique : true})
    email : string;

    @CreateDateColumn()
    createdDate : Date;
    
}