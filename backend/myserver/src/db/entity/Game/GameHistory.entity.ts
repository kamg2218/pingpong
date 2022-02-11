import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../User/UserEntity";

@Entity()
export class GameHistory {
    
    @PrimaryGeneratedColumn('uuid')
    gameid : string;

    // @Column()
    // map : string;

    @ManyToOne(type => User, user => user.playWith1, { onDelete : "SET NULL", eager : true })
    @JoinColumn({ name : "player1" })
    player1 : User;

    @ManyToOne(type => User, user => user.playWith2, { onDelete : "SET NULL", eager : true })
    @JoinColumn({ name : "player2" })
    player2 : User;

    @ManyToOne(type => User, user => user.win, { onDelete : "SET NULL", eager : true})
    @JoinColumn({ name : "winner" })
    winner : User;

    @Column()
    scoreP1 : number;
    
    @Column()
    scoreP2 : number;

    @CreateDateColumn()
    startTime : Date;

    @Column({type : "float4"})
    playTimeSec : number;
}