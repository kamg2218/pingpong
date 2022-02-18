import { BadRequestException, Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WSAuthGuard } from 'src/chat/ws-guard';
import { getCustomRepository, getRepository, LessThan, Not} from 'typeorm';

import { onlineManager } from './online/onlineManager';
import { UserRepository, BlockedFriendsRepository, RestrictedListReopsitory, FriendsRepository } from 'src/db/repository/User/UserCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { User, BlockedFriends } from 'src/db/entity/User/UserEntity';
import { ChatMembershipRepository, ChatBanListRepository, ChatRoomRepository, ChatHistoryRepository } from "src/db/repository/Chat/ChatCustomRepository";
import { ChatMembership, ChatRoom, ChatBanList, ChatHistory } from 'src/db/entity/Chat/ChatEntity';
import { ChatGatewayService } from './chatGateway.service';
import { onlineChatRoom } from './online/onlineChatRoom';
import { onlineChatRoomManager } from './online/onlineChatRoomManager';
import e from 'cors';
import { userInfo } from 'os';

const options = {
  cors : {
    origin : "http://localhost:3000",
  }
}

// @WebSocketGateway({namespace: /\/ws-.+/}) // 정규표현식
@WebSocketGateway(options)
// @UseGuards(AuthGuard('ws-jwt'))
export class ChatGateway {
@WebSocketServer() public server : Server;

  constructor(
    private readonly chatGatewayService : ChatGatewayService,
    private readonly logger : Logger,
  ) {}

  afterInit(server: Server) : any {
    console.log('websocketserver init');
    onlineChatRoom.init(server);
  }
  private log(msg : String) {
    this.logger.log(msg, "UserGateway");
}

  // 유저가 참여한 채팅방 조회 : 현재 유저가 참여한 채팅방만 조회
  @SubscribeMessage('myChatRoom')
  async getAllChatByUser(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "myChatRoom", ...payload1});
   
    const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));


    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const repo_user = getCustomRepository(UserRepository);
    const joinedchat : ChatMembership[] = await repo_chatmember.find({
      where : {member : {userid : socket.userid}},
      select : ["index", "chatroom"]
    });
    let order = [];
    let chatroom = [];
    for (let index in joinedchat) {
 
    }



    // const chatList = await Promise.all(joinedchat.map(async (element : ChatMembership) => {
    //   const {chatid, title, type, password} = element.chatroom;
    //   let members = [];
    //   // let managers = [];
    //   let lock = password ? true : false;
    //   const max = 100 // .env
    //   const ownerInfo = await repo_chatmember.findOne({where : [{chatroom : element.chatroom}, {position : "owner" }]});
    //   const owner = ownerInfo.member.userid;

      // // 매니저가 여러명일 경우
      // const repo_chat : ChatMembership[] = await getCustomRepository(ChatMembershipRepository).find({chatroom: element.chatroom});
      // const managerList = repo_chat.map((element : ChatMembership) => {
      //   const manager = element.position;
      //   if (manager != "manager")
      //     return ;
      //   managers.push(element.member.userid);
      // })
    //   const managers = this.chatGatewayService.managerList(element);

    //   // 멤버가 여러명일 경우
    //   const memberInfo = await repo_chatmember.find({chatroom: element.chatroom});
    //   memberInfo.map((chatmember : ChatMembership) => {
    //     members.push(repo_user.getSimpleInfo(chatmember.member));
    //   })
    //   order.push(element.chatroom.chatid);
    //   chatroom.push({title, chatid, owner, managers, members, lock, type, max});
    // }));
    // socket.emit("myChatRoom", {order, chatroom});
  }

  // 전체 채팅방 조회 : 생성되어 있는 전체 채팅방 조회(내가 들어가지 않은 채팅방 + private 제외)
  @SubscribeMessage('publicChatRoom')
  async getAllChat(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "publicChatRoom", ...payload1});
    // userid로 내가 없는 채팅방 가져오기
    // const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
    console.log(user);
    // const payload = {userid : user.userid};

    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const repo_user = getCustomRepository(UserRepository);
    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    console.log('1');
    // const notJoinedChat : ChatMembership[] = await repo_chatmember.find({member: {userid : Not(user.userid)}});

    const notJoinedChat : ChatMembership[] = await repo_chatmember.find({
      where : [{
        chatroom : {
          type: "public"
        },
        member : {userid : Not(user.userid)}
      }],
      relations : ["chatroom"]
    });
    //where : {member: {userid : Not(user.userid)}, chatroom : {type : "public"}});
    // const userInfo = repo_user.getSimpleInfo(user);
    // 지금은 중복됨
    // const notJoinedList = await getCustomRepository(ChatMembershipRepository)
    //   .createQueryBuilder("chatmember")
    //   .distinctOn(["chatmember.chatroom"])
    //   .where("chatmember.chatroom.type = :type", {name: "public"})
    //   .andWhere("chatmember.member NOT IN :userid", {userid: user.userid})
    //   .getMany()
    console.log('22');
    // .where("chatmember.member NOT IN :id AND chatmember.chatroom.type = :name", {id:ChatMember.userid, name:"public"})

    let order = [];
    let chatroom = [];
    console.log('2')
    const chatList = await Promise.all(notJoinedChat.map(async (element : ChatMembership) => {
      const {chatid, title, type, password} = element.chatroom;
      let members = [];
      let managers = [];
      let lock = password ? true : false;
      const max = 100 // .env
      console.log('3')
      const ownerInfo = await repo_chatmember.findOne({where : [{chatroom : element.chatroom}, {position : "owner" }]});
      const owner = ownerInfo.member.userid;
      
      // 매니저가 여러명일 경우
      console.log('4')
      const repo_chat : ChatMembership[] = await repo_chatmember.find({chatroom: element.chatroom, position:"manager"});
      repo_chat.map((chatmember : ChatMembership) => {
        managers.push(chatmember.member.userid);
      })

      // 멤버가 여러명일 경우
      console.log('5')
      const memberInfo = await repo_chatmember.find({chatroom: element.chatroom});
      memberInfo.map((element : ChatMembership) => {
        members.push(repo_user.getSimpleInfo(element.member));
      })
      order.push(element.chatroom.chatid);
      chatroom.push({title, chatid, owner, managers, members, lock, type, max});
    }));
    socket.emit("publicChatRoom", {order, chatroom});
  }


  // 채팅방 만들기
  @SubscribeMessage('createChatRoom')
  async createchat(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "createChatRoom", ...payload1});
    const repo_user = getCustomRepository(UserRepository);
    const user = await repo_user.findOne(onlineManager.userIdOf(socket.id));
    let payload;
    if (process.env.NODE_ENV === "dev") {
      payload = {member : [], type:payload1.type, title:payload1.title, password:payload1.password};
      if (payload1.member) {
        await Promise.all(payload1.member.map(async (one)=>{
          let memberInfo = await repo_user.findOne({nickname : one});
          payload.member.push(memberInfo.userid);
        }));
      }
    }
    else {
      payload = payload1;
    }
    let members =[];
    // 1. payload 확인 : private & password -> public & password -> 
    // 2. member
    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    const repo_blockList = getCustomRepository(BlockedFriendsRepository);
    const chatid = await this.chatGatewayService.createChatRoom(payload, user);
    const newRoom = onlineChatRoomManager.create(chatid);
    const chatroomInfo = await repo_chatroom.findOne({chatid : chatid});
    this.log("ok create chatroom");
    await this.chatGatewayService.createowner(user, chatroomInfo);
    newRoom.join(socket.id);
    members.push(repo_user.getSimpleInfo(user));
    this.log("ok create owner");
    for (let index in payload.member) {
      let userid = payload.member[index];
      let chatroomIn = await repo_chatroom.findOne({chatid: chatid});
      let mem = await repo_user.findOne({userid : userid});
      if (!await repo_blockList.amIBlockedBy(user, mem)) {
        if (await this.chatGatewayService.enterChatRoom(mem, chatroomIn)) {
          members.push(repo_user.getSimpleInfo(mem));
          newRoom.join(onlineManager.socketIdOf(mem.userid));
        }
      }
    }
    this.log("ok create member");
    const res = await repo_chatroom.getRoomInfo(chatroomInfo);
    newRoom.announce("enterChatRoom", res);
  }
  

  // 채팅방 입장
  @SubscribeMessage('enterChatRoom')
  async enterChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "enterChatRoom", ...payload1});
    
    let payload;
    if (process.env.NODE_ENV === "dev") {
      const chatroom = await getCustomRepository(ChatRoomRepository).findOne({title: payload1.title});
      payload = {chatid: chatroom.chatid, password:payload1?.password};
    }
    else {
      payload = payload1;
    }
    const repo_user = getCustomRepository(UserRepository);
    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    const repo_chatMember = getCustomRepository(ChatMembershipRepository);
    const user = await repo_user.findOne(onlineManager.userIdOf(socket.id));
    this.log("test log")
    if (user.banPublicChat) {
      console.log("test1-1")
      this.log("you banPublicChat");
      return ;
    }
    // ban되어있는지 확인(chatBanList)
   
    const chatroom = await repo_chatroom.findOne({chatid: payload.chatid});
    // 방이 존재하는지
    console.log("test2")
    if (chatroom === undefined) {
      this.log("not exist room");
      return ;
    }
    // private방에 초대되었는가?
    const banList = await getCustomRepository(ChatBanListRepository).findOne({chatRoom: chatroom, user: user});
    if (banList) {
      this.log("you baned");
      return ; // 채팅방 못들어감
    }
    console.log("test3")
    if (chatroom.type === "private") {
      this.log("not invite you");
      return ;
    }
    console.log("test4")
    // 이미 채팅방에 입장되어있을 경우
    if (await repo_chatMember.findOne({chatroom : chatroom, member : user})) {
      this.log("already enter the room");
      return ;
    }
    // 패스워드 맞는지
    if (chatroom.password !== payload.password) {
      this.log("not match password");
    }
    // 정원초과인지
    if (chatroom.memberCount === 100)  {
      this.log("room is full");
      return ; // 정원 초과
    }
    
    // 채팅방 입장 online으로 변경
    await this.chatGatewayService.enterChatRoom(user, chatroom);
    const room = onlineChatRoomManager.getRoomByid(payload.chatid);
    room.join(socket.id);
    room.announceExceptMe(socket.id, "updateChatRoom", {chatid : chatroom.chatid, enterUser : [repo_user.getSimpleInfo(user)]});
    const res = await repo_chatroom.getRoomInfo(chatroom);
    socket.emit("enterChatRoom", res);
  }

  @SubscribeMessage('updateChatRoom')
  async updateChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "updateChatRoom", ...payload1});
    let payload = payload1;
    if (process.env.NODE_ENV === "dev") {
      const chatroom = await getCustomRepository(ChatRoomRepository).findOne({title: payload1.title});
      payload["chatid"] = chatroom.chatid;
      delete payload["title"]
    }
    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const changer = await repo_chatmember.findOne({member : {userid : socket.userid}, chatroom: {chatid : payload.chatid}});
    if (changer === undefined || changer.position != "owner") {
      console.log("Not authorized");
      return false;
    }
    const {title, type, password} = payload;
    const change = {title, type, password};
    for (let key in change) {
      if (!change[key])
        delete change[key];
    }
    if (type === "private")
      change["password"] = null;
    if (payload.lock === false) {
      let room = await repo_chatroom.findOne(payload.chatid);
      if (room.type === "public")
        change[password] = null;
    }
    if (Object.keys(change).length)
      await repo_chatroom.update(payload.chatid, change);
    this.log("update title, type, password");
    const addManagerList : string[] = payload.addManager;
    if (addManagerList) {
      await Promise.all(addManagerList.map(async userid=>{
        if (! await repo_chatmember.setAsManager(userid)) {
          let index = addManagerList.findIndex(value=>value === userid);
          if (index !== -1)
            addManagerList.slice(index, 1);
        }
      }));
    }
    const deleteManagerList = payload.deleteManager;
    if (deleteManagerList) {
      await Promise.all(deleteManagerList.map(async userid=>{
        if (!await repo_chatmember.setAsNormal(userid)) {
          let index = deleteManagerList.findIndex(value=>value === userid);
          deleteManagerList.slice(index, 1);
        }
      }));
    }
    if (payload.lock !== undefined && change.password) {
      change["lock"] = change.password ? true : false;
    }
    if (addManagerList && addManagerList.length)
      change["addManager"] = addManagerList;
    if (deleteManagerList && deleteManagerList.length)
      change["deleteManager"] = deleteManagerList;
    onlineChatRoomManager.getRoomByid(payload.chatid).announce("updateChatRoom", change);
  }

  // 채팅방 유저 초대 :
  @SubscribeMessage('inviteChatRoom')
  async inviteChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
  this.log({gate : "inviteChatRoom", ...payload1});
  let payload;
  if (process.env.NODE_ENV === "dev") {
    const chatRoomx = await getCustomRepository(ChatRoomRepository).findOne({title : payload1.title})
    payload ={user : [], chatid: chatRoomx.chatid};
    await Promise.all(payload1.user.map(async (nickname : string) => {
      let theother = await getCustomRepository(UserRepository).findOne({nickname: nickname});
      if (theother)
        payload.user.push(theother.userid);
    }));
  }
  else
    payload = payload1;
  const repo_chatmember = getCustomRepository(ChatMembershipRepository);
  const repo_user = getCustomRepository(UserRepository);
  const repo_blockList = getCustomRepository(BlockedFriendsRepository);
  const repo_friendList = getCustomRepository(FriendsRepository);
  const repo_chatRoom = getCustomRepository(ChatRoomRepository);
  let chatRoom = await repo_chatRoom.findOne({chatid: payload.chatid});
  if (!await repo_chatmember.findOne({chatroom : {chatid : payload.chatid}, member : {userid : socket.userid}})) {
    this.log("not you exist chatroom");
    return ;
  }
  let invitedU = payload.user;
  const user = await repo_user.findOne(socket.userid);
  const room = onlineChatRoomManager.getRoomByid(payload.chatid);
  await Promise.all(invitedU.map(async (userid: string) => {
    let theOther = await repo_user.findOne(userid);
    let res = await Promise.all([
      repo_blockList.amIBlockedBy(user, theOther),
      repo_blockList.didIBlock(user, theOther),
      !repo_friendList.isMyFriend(user, theOther)
    ]);
    if (res.findIndex(result=>result===true) !== -1) {
      //Error
      return ;
    }
    if (await this.chatGatewayService.enterChatRoom(theOther, chatRoom)) {
      chatRoom = await repo_chatRoom.findOne(payload.chatid);
      // enterchatRoom 함수에 같이 넣기 아래부분
      let friendSocket = onlineManager.socketIdOf(theOther.userid);
      if (friendSocket) {
        room.join(friendSocket);
        const res = await repo_chatRoom.getRoomInfo(chatRoom);
        this.server.to(friendSocket).emit("enterChatRoom", res);
      }
      room.announceExceptMe(friendSocket, "updateChatRoom", {chatid : chatRoom.chatid, enterUser : [repo_user.getSimpleInfo(theOther)]});
    }
  }));
  }

  // 채팅방 나가기
  @SubscribeMessage('exitChatRoom')
  async leaveChat(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "exitChatRoom", ...payload1});
    let payload;
    if (process.env.NODE_ENV === "dev") {
      const chatRoomX = await getCustomRepository(ChatRoomRepository).findOne({title : payload1.title});
      payload = {chatid : chatRoomX.chatid};
    }
    else {
      payload = payload1;
    }
    // 나중에 정해야함!!!!!!!채팅방 소유자가 나갈 경우(매니저 없음)
    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const chatUser = await repo_chatmember.findOne({chatroom:{chatid : payload.chatid}, member:{userid : socket.userid}});
    if (!chatUser) {
        this.log("You are not in this chatRoom");
        return false;
    }
    await repo_chatmember.deleteChatUser(socket.userid, payload.chatid);
    const room = onlineChatRoomManager.getRoomByid(payload.chatid);
    room.leave(socket.id);
    room.announce("updateChatRoom", {exitUser : [socket.userid]});
    if (await this.chatGatewayService.shouldDeleteRoom(payload.chatid)) {
      await this.chatGatewayService.deleteChatRoom(payload.chatid);
    }
    else if (this.chatGatewayService.shouldDelegateOwner(chatUser)) {
      await this.chatGatewayService.delegateteOwner(payload.chatid);
    }
    return true;
  }

  // 채팅방 강퇴 :
  @SubscribeMessage('kickChatRoom') 
  async kickChatMember(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "kickChatRoom", ...payload1});
    let payload;
    if (process.env.NODE_ENV === "dev") {
      const chatRoomX = await getCustomRepository(ChatRoomRepository).findOne({title : payload1.title});
      const userX = await getCustomRepository(UserRepository).findOne({nickname : payload1.nickname});
      payload = {chatid : chatRoomX.chatid, userid : userX.userid};
    }
    else {
      payload = payload1;
    }
    const repo_chatMember = getCustomRepository(ChatMembershipRepository);
    const kickUser = await repo_chatMember.findOne({chatroom : {chatid : payload.chatid}, member : {userid : payload.userid}});
    const setter = await repo_chatMember.findOne({chatroom : {chatid : payload.chatid}, member : {userid : socket.userid}});
    if (!setter || setter.position === "normal") {
      this.log("Not Authorized");
      return ;
    }
    if (!kickUser || kickUser.position !== "normal") {
      this.log("Can't kicke this user");
      return ;
    }
    let exitUser = [kickUser.member.userid];
    await this.chatGatewayService.kickUserFromChatRoom(kickUser.member, payload.chatid);
    let room = onlineChatRoomManager.getRoomByid(payload.chatid);
    let socketid = onlineManager.socketIdOf(kickUser.member.userid);
    if (socketid) {
      room.leave(socketid);
      this.server.to(socketid).emit("kickChatRoom", {chatid : payload.chatid});
    }
    room.announce("updateChatRoom", {exitUser});
    this.log(`${setter.member.nickname} kicked ${kickUser.member.nickname}`);
  }

  // 채팅방 내부 :
  @SubscribeMessage('chatHistory')
  async chatHistory(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "chatHistory", ...payload1});
    // const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
    const payload = {userid : user.userid, chatid: payload1.chatid};

    let list = [];
    // {userid, contents};

    const repo_chatHistory : ChatHistory[] = await getCustomRepository(ChatHistoryRepository).find({chatRoom: {chatid : payload.chatid}});
    const chatList = repo_chatHistory.map(async (element : ChatHistory) => {
      const contents = element.contents;
      const userid = element.userid;
      list.push({userid, contents});
    })
    socket.emit("chatHistory", list);
  }
  

  // 채팅 히스토리 업데이트 : 얼마나 어떻게 보여줄지 (최근 30줄 표시, 스크롤 위로 올리면 30줄씩 업데이트)
  @SubscribeMessage('chatHistoryUpdate')
  async chatHistoryUpdate(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "chatHistoryUpdate", ...payload1});
    // const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    const user = await getCustomRepository(UserRepository).findOne(onlineManager.userIdOf(socket.id));
    const payload = {userid : user.userid, chatid: payload1.chatid};

    const chatid = payload.chatid;
    // 소켓에 저장한다 하고 짜기
    const index = socket.historyIndex;
    
    const chatHistory : ChatHistory[] = await getCustomRepository(ChatHistoryRepository).find(
      {
        skip:index, take:30, select:["contents", "userid", "createDate"],
        where : [{chatRoom : {chatid: payload.chatid}}],
      });
    console.log("history : ", chatHistory);

    socket.emit("chatHistoryUpdate", {chatid, chatHistory});
  }

  // 채팅 메세지 :
  @SubscribeMessage('chatMessage')
  async chatMessage(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "chatMessage", ...payload1});
    let payload;
    if (process.env.NODE_ENV === "dev") {
      const chatRoom = await getCustomRepository(ChatRoomRepository).findOne({title : payload1.title});
      payload = {contents: payload1.contents, chatid: chatRoom.chatid};
    }
    else {
      payload = payload1;
    }
    const repo_chathistory = getCustomRepository(ChatHistoryRepository);
    const repo_chatMember = getCustomRepository(ChatMembershipRepository);
    const chatRoom = await getCustomRepository(ChatRoomRepository).findOne({chatid : payload.chatid});
    // const chathistory = await repo_chathistory.find({chatid : chatRoom});
    // 음소거일 경우 못보냄
    // 2명 private 차단리스트 확인.
    // 나머지 전부 보냄.
    const me = await repo_chatMember.findOne({chatroom: {chatid : payload.chatid}, member : {userid : socket.userid}});
    let now = new Date();
    if (me.muteUntil > now) {
      this.log("Mute")
      return false;
    }
    const room = onlineChatRoomManager.getRoomByid(payload.chatid);
    if (chatRoom.type === "private" && chatRoom.memberCount === 2)
      room.sayToRoom(socket, payload);
    else
      room.announce("chatMessage", {contents : payload.contents});
    repo_chathistory.insertHistory(socket.userid, payload.contents, chatRoom);
  }

  // 채팅 음소거 :
  @SubscribeMessage('chatMute')
  async chatMute(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "chatMute", ...payload1});
    let payload;
    if (process.env.NODE_ENV === "dev") {
      payload = {userid : payload1.userid, chatid: payload1.chatid, time: payload1.time};
    }
    else
      payload = payload1;
    // 관리자가 아닌 경우, owner에게 했을 경우, 관리자가 관리자에게 했을 경우
    const repo_chatMember = getCustomRepository(ChatMembershipRepository);
    const me = await repo_chatMember.findOne({chatroom : {chatid : payload.chatid}, member : {userid : socket.userid}});
    const other = await repo_chatMember.findOne({chatroom : {chatid : payload.chatid}, member : {userid : payload.userid}});
    if (!me || !other) {
      this.log("No such user OR Not in the chatRoom");
      return false;
    }
    if (me.position === "normal" || other.position !== "normal") {
      this.log("not normal user");
      return false;
    }
    let time = new Date();
    time.setSeconds(time.getSeconds() + payload.time);
    await repo_chatMember.update(other.index, {muteUntil: time});
    return true;
  }
}