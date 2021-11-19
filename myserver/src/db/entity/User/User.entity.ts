import {Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, OneToOne, BeforeRemove, getCustomRepository, getRepository} from "typeorm";
import {UserPosition, UserStatus, LadderLevel} from '../../../type/UserEntity.type'
import { ChatBanList } from "../Chat/ChatBanList.entity";
import { ChatMemberShip } from "../Chat/ChatMembership.entity";
import { GameHistory } from "../Game/GameHistory.entity";
import { GameRoomMembership } from "../Game/GameRoomMembership.entity";
import { BlockedFriends } from "./BlockedFriends.entity";
import { Friends } from "./Friends.entity";
import {ChatRoomRepository} from 'src/db/repository/ChatRoom.repository';

@Entity()
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    userid : string;

    @Column({ unique : true })
    email : string;

    @Column({ unique : true })
    nickname : string;

    @CreateDateColumn({ type : "timestamp" })
    createDate : Date;

    @Column()
    profile : string;

    @Column({ default : false })
    banLogin : boolean;

    @Column({ default : false })
    banPublicChat : boolean;

    @Column({ default : 0 })
    ladderPoint : number;

    @Column({ default : "bronze" })
    ladderLevel : LadderLevel;

    @Column({ default : "logout" })
    status : UserStatus;

    @Column({ default : "normal" })
    position : UserPosition;

    @OneToMany(type=>Friends, friend=>friend.requestFrom, { cascade : true })
    friendsFrom : Friends[];

    @OneToMany(type=>Friends, friend=>friend.requestTo, { cascade : true })
    friendsTo : Friends[];

    @OneToMany(type=>BlockedFriends, blockFriend=>blockFriend.useridMy, { cascade : true })
    blockFrom : Friends[];

    @OneToMany(type=>BlockedFriends, blockFriend=>blockFriend.useridBlock, { cascade : true })
    blockTo : Friends[];

    @OneToMany(type=>GameRoomMembership, room=>room.userid, { cascade : true })
    gamerooms : GameRoomMembership[];

    @OneToMany(type=>GameHistory, gamehistory=>gamehistory.player1, { cascade : true })
    playWith1 : GameHistory[];

    @OneToMany(type=>GameHistory, gamehistory=>gamehistory.player2, { cascade : true })
    playWith2 : GameHistory[];

    @OneToMany(type=>GameHistory, gamehistory=>gamehistory.winner, { cascade : true })
    win : GameHistory[];

    @OneToMany(type=>ChatBanList, banlists=>banlists.userid, { cascade : true })
    banUser : ChatBanList[];

    @OneToMany(type=>ChatMemberShip, member=>member.userid, { cascade : true })
    member : ChatBanList[];

    @BeforeRemove()
    async updateChatRoomInfo() {
        const repo_chatroom = getCustomRepository(ChatRoomRepository);
        const repo_membership = getRepository(ChatMemberShip);
        const rooms = await repo_membership.find({userid : this});
        if (rooms)
            rooms.map(room=>(repo_chatroom.exitRoom(this, room.chatroom)))
    }
}