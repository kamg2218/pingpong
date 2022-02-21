import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class RestrictedList {

    @PrimaryColumn()
    email : string;

    @Column({ type : "timestamp" })
    restrictUntil : Date;
}