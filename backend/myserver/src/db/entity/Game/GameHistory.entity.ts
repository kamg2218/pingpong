import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../User/User.entity";

@Entity()
export class GameHistory {
    
    @PrimaryGeneratedColumn('uuid')
    gameid : string;

    @Column()
    map : string;

    @ManyToOne(type => User, user => user.playWith1, { onDelete : "SET NULL" })
    @JoinColumn({ name : "player1" })
    player1 : string;

    @ManyToOne(type => User, user => user.playWith2, { onDelete : "SET NULL" })
    @JoinColumn({ name : "player2" })
    player2 : string;

    @ManyToOne(type => User, user => user.win, { onDelete : "SET NULL" })
    @JoinColumn({ name : "winner" })
    winner : string;

    @Column()
    scoreP1 : number;
    
    @Column()
    scoreP2 : number;

    @CreateDateColumn() // 흠.. 자동생성해야할까.
    startTime : Date;

    @Column()
    playTimeSec : number;
}