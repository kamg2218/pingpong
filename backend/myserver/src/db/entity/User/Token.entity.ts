import { AfterInsert, AfterLoad, BeforeInsert, BeforeRemove, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./User.entity";
import { getCustomRepository } from "typeorm";
import { UserRepository } from "src/db/repository/User.repository";
import { Socket } from "socket.io";

@Entity()
export class Token {

    @PrimaryColumn()
    refreshToken : string;

    // 관계선택사항 - 선택참여
    @OneToOne((type)=>User, (user)=>user.userid, { eager : true, onDelete : "CASCADE" })
    @JoinColumn({name : "user"})
    user : User

    @AfterInsert()
    userSwitchToLogin() {
        const repo = getCustomRepository(UserRepository);
        repo.switchToLogin(this.user);
    }

    @BeforeRemove()
    userSwitchToLogout() {
        const repo = getCustomRepository(UserRepository);
        repo.switchToLogout(this.user);
    }
}