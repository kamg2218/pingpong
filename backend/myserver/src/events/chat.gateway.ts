import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { getCustomRepository } from 'typeorm';
import { onlineManager } from './online/onlineManager';
import { UserRepository, BlockedFriendsRepository, FriendsRepository } from 'src/db/repository/User/UserCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { ChatMembershipRepository, ChatBanListRepository, ChatRoomRepository, ChatHistoryRepository } from "src/db/repository/Chat/ChatCustomRepository";
import { ChatRoom } from 'src/db/entity/Chat/ChatEntity';
import { ChatGatewayService } from './chatGateway.service';
import { onlineChatRoom } from './online/onlineChatRoom';
import { onlineChatRoomManager } from './online/onlineChatRoomManager';

const options = {
  cors : {
    origin : "http://localhost:3000",
  }
}

// @WebSocketGateway({namespace: /\/ws-.+/}) // 정규표현식
@WebSocketGateway(options)
export class ChatGateway {
@WebSocketServer() public server : Server;

  constructor(
    private readonly chatGatewayService : ChatGatewayService,
    private readonly logger : Logger,
  ) {}

  afterInit(server: Server) : any {
    onlineChatRoom.init(server);
  }
  private log(msg : String) {
    this.logger.log(msg, "UserGateway");
}

  // 유저가 참여한 채팅방 조회 : 현재 유저가 참여한 채팅방만 조회
  @SubscribeMessage('myChatRoom')
  async getAllChatByUser(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "myChatRoom", ...payload1});
    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    let order = [];
    let chatroom = [];
    const joinedchat : ChatRoom[] = await repo_chatmember.getMyChatRoom(socket.userid);
    for (let index in joinedchat) {
      let myRoom = joinedchat[index]
      let info = await repo_chatroom.getRoomInfo(myRoom);
      order.push(myRoom.chatid);
      chatroom.push(info);
    }
    socket.emit("myChatRoom", {order, chatroom});
  }

  // 전체 채팅방 조회 : 생성되어 있는 전체 채팅방 조회(내가 들어가지 않은 채팅방 + private 제외)
  @SubscribeMessage('publicChatRoom')
  async getAllChat(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "publicChatRoom", ...payload1});
    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    const myChatroomList : ChatRoom[] = await repo_chatmember.getMyChatRoom(socket.userid);
    const publicChatroomList = await repo_chatroom.find({type : "public"});
    for (let index in myChatroomList) {
      let chatid = myChatroomList[index].chatid;
      let findResult = publicChatroomList.findIndex(list=>list.chatid === chatid)
      if (findResult !== -1)
        publicChatroomList.splice(findResult, 1);
    };
    let order = [];
    let chatroom = [];
    for (let index in publicChatroomList) {
      let myRoom = publicChatroomList[index];
      let info = await repo_chatroom.getRoomInfo(myRoom);
      order.push(myRoom.chatid);
      chatroom.push(info);
    }
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
      if (await this.chatGatewayService.checkIfIcanAddFriend(user, mem)) {
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
    const user = await repo_user.findOne(onlineManager.userIdOf(socket.id));
    const chatroom = await repo_chatroom.findOne({chatid: payload.chatid});
    if (!chatroom) {
      this.log(`Bad Request : No such room`)
      return ;
    }
    if (! await this.chatGatewayService.checkIfcanEnterRoom(user, chatroom, payload.password)) {
      return ;
    }
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
      repo_friendList.isNotMyFriend(user, theOther)
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
    let payload;
    if (process.env.NODE_ENV === "dev") {
      const chatRoomX = await getCustomRepository(ChatRoomRepository).findOne({title :payload1.title});
      payload = {chatid : chatRoomX.chatid}
    }
    else 
      payload = payload1;
    const repo_chathistory = getCustomRepository(ChatHistoryRepository);
    const lists = await repo_chathistory.bringHistory(socket.historyIndex, payload.chatid);
    const {lastIndex, histories} = repo_chathistory.amugeona(lists);
    if (lastIndex !== -1)
      socket.historyIndex = lastIndex;
    socket.emit("chatHistory", {chatid : payload.chatid, list : histories});
  }
  

  // 채팅 히스토리 업데이트 : 얼마나 어떻게 보여줄지 (최근 30줄 표시, 스크롤 위로 올리면 30줄씩 업데이트)
  @SubscribeMessage('chatHistoryUpdate')
  async chatHistoryUpdate(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    this.log({gate : "chatHistoryUpdate", ...payload1});
    let payload;
    if (process.env.NODE_ENV === "dev") {
      const chatRoomX = await getCustomRepository(ChatRoomRepository).findOne({title :payload1.title});
      payload = {chatid : chatRoomX.chatid}
    }
    else 
      payload = payload1;
    const repo_chathistory = getCustomRepository(ChatHistoryRepository);
    const lists = await repo_chathistory.bringHistory(socket.historyIndex, payload.chatid);
    const {lastIndex, histories} = repo_chathistory.amugeona(lists);
    if (lastIndex !== -1)
      socket.historyIndex = lastIndex;
    socket.emit("chatHistoryUpdate", {chatid : payload.chatid, list : histories});
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
    if (me.muteUntil && me.muteUntil > now) {
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