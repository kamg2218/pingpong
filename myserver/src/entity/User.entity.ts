import {Entity, PrimaryColumn, Column} from "typeorm";

@Entity()
export class User {

    @PrimaryColumn({unique : true})
    email: string;

    @Column()
    password: string;

    @Column({unique : true})
    nickname: string;
}
