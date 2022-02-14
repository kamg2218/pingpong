import {Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, OneToOne, BeforeRemove, getCustomRepository, getRepository, BaseEntity} from "typeorm";
import {UserPosition, UserStatus, LadderLevel} from '../../../type/UserEntity.type'
import { ChatBanList } from "../Chat/ChatBanList.entity";
import { ChatMembership } from "../Chat/ChatMembership.entity";
import { GameHistory } from "../Game/GameHistory.entity";
import { GameMembership } from "../Game/GameMembership.entity";
import { BlockedFriends } from "./BlockedFriends.entity";
import { Friends } from "./Friends.entity";
import {ChatRoomRepository} from 'src/db/repository/Chat/ChatRoom.repository';

@Entity()
export class User extends BaseEntity {
    
    @PrimaryGeneratedColumn('uuid')
    userid : string;

    @Column({ nullable : true})
    twoFactorAuthenticationSecret?: string;

    @Column({ default : false })
    isTwoFactorAuthenticationEnabled : boolean

    @Column({ unique : true })
    email : string;

    @Column({ unique : true })
    nickname : string;

    @CreateDateColumn({ type : "timestamp" })
    createDate : Date;

    @Column()
    profile : number;

    @Column({ default : false })
    banLogin : boolean;

    @Column({ default : false })
    banPublicChat : boolean;

    @Column({ default : 0, type : "float4"})
    levelpoint : number;
    
    @Column({ default : "not_registered" })
    status : UserStatus;

    @Column({ nullable : true })
    refreshToken : string

    @Column({ default : "normal" })
    position : UserPosition;

    @OneToMany(type=>Friends, friend=>friend.requestFrom, { cascade : true })
    friendsFrom : Friends[];

    @OneToMany(type=>Friends, friend=>friend.requestTo, { cascade : true })
    friendsTo : Friends[];

    @OneToMany(type=>BlockedFriends, blockFriend=>blockFriend.me, { cascade : true })
    blockFrom : Friends[];

    @OneToMany(type=>BlockedFriends, blockFriend=>blockFriend.block, { cascade : true })
    blockTo : Friends[];

    @OneToMany(type=>GameMembership, room=>room.member, { cascade : true })
    gamerooms : GameMembership[];

    @OneToMany(type=>GameHistory, gamehistory=>gamehistory.player1, { cascade : true })
    playWith1 : GameHistory[];

    @OneToMany(type=>GameHistory, gamehistory=>gamehistory.player2, { cascade : true })
    playWith2 : GameHistory[];

    @OneToMany(type=>GameHistory, gamehistory=>gamehistory.winner, { cascade : true })
    win : GameHistory[];

    @OneToMany(type=>ChatBanList, banlists=>banlists.userid, { cascade : true })
    banUser : ChatBanList[];

    @OneToMany(type=>ChatMembership, member=>member.member, { cascade : true })
    member : ChatBanList[];

    @BeforeRemove()
    async updateChatRoomInfo() {
        const repo_chatroom = getCustomRepository(ChatRoomRepository);
        const repo_membership = getRepository(ChatMembership);
        const rooms = await repo_membership.find({member : this});
        if (rooms)
            rooms.map(room=>(repo_chatroom.exitRoom(this, room.chatroom)))
    }
}