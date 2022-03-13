import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { getCustomRepository } from 'typeorm';
import { onlineManager } from '../online/onlineManager';
import { UserRepository, BlockedFriendsRepository, FriendsRepository } from 'src/db/repository/User/UserCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { ChatMembershipRepository, ChatRoomRepository, ChatHistoryRepository } from "src/db/repository/Chat/ChatCustomRepository";
import { ChatHistory, ChatRoom } from 'src/db/entity/Chat/ChatEntity';
import { ChatGatewayService } from './chatGateway.service';
import { onlineChatRoom } from '../online/onlineChatRoom';
import { onlineChatRoomManager } from '../online/onlineChatRoomManager';
import { CORS_ORIGIN } from 'src/config/const';
import { ChatHistoryDTO, ChatHistoryUpdateDTO, ChatMessageDTO, ChatMuteDTO, CreateChatRoomDTO, EnterChatRoomDTO, ExitChatRoomDTO, InviteChatRoomDTO, KickChatRoomDTO, UpdateChatRoomDTO } from './dto/chat.dto';

const options = {
  cors : {
      origin : CORS_ORIGIN,
      credentials : true,
  }
}

// @WebSocketGateway({namespace: /\/ws-.+/}) // 정규표현식
@WebSocketGateway(options)
@UsePipes(new ValidationPipe({      
  whitelist : true,
  // forbidNonWhitelisted : true,
  transform : true}))
export class ChatGateway {
@WebSocketServer() public server : Server;

  constructor(
    private readonly chatGatewayService : ChatGatewayService,
    private readonly logger : Logger,
  ) {}

  afterInit(server: Server) : any {
    onlineChatRoom.init(server);
  }
  private log(msg : any) {
    this.logger.log(msg, "UserGateway");
}
  private over(gateway : string) {
    // console.log(`[${gateway} is over]---------\n`);
  }

  // 유저가 참여한 채팅방 조회 : 현재 유저가 참여한 채팅방만 조회
  @SubscribeMessage('myChatRoom')
  async getAllChatByUser(@ConnectedSocket() socket: AuthSocket) {
    this.log({gate : "myChatRoom"});

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
    return this.over("myChatRoom");
  }

  // 전체 채팅방 조회 : 생성되어 있는 전체 채팅방 조회(내가 들어가지 않은 채팅방 + private 제외)
  @SubscribeMessage('publicChatRoom')
  async getAllChat(@ConnectedSocket() socket: AuthSocket) {
    this.log({gate : "publicChatRoom"});

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
    return this.over("publicChatRoom");
  }


  // 채팅방 만들기
  @SubscribeMessage('createChatRoom')
  async createchat(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: CreateChatRoomDTO) {
    this.log({gate : "createChatRoom", ...payload});

    const repo_user = getCustomRepository(UserRepository);
    const user = await repo_user.findOne(onlineManager.userIdOf(socket.id));
    let members =[];
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
      if (await this.chatGatewayService.checkIfIcanInvite(user, mem)) {
        if (await this.chatGatewayService.enterChatRoom(mem, chatroomIn)) {
          members.push(repo_user.getSimpleInfo(mem));
          newRoom.join(onlineManager.socketIdOf(mem.userid));
        }
        this.log("ok create member");
      }
    }
    const res = await repo_chatroom.getRoomInfo(chatroomInfo);
    newRoom.announce("enterChatRoom", res);
    return this.over("enterChatRoom");
  }
  

  // 채팅방 입장
  @SubscribeMessage('enterChatRoom')
  async enterChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: EnterChatRoomDTO) {
    this.log({gate : "enterChatRoom", ...payload});

    const repo_user = getCustomRepository(UserRepository);
    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    const user = await repo_user.findOne(onlineManager.userIdOf(socket.id));
    const chatroom = await repo_chatroom.findOne({chatid: payload.chatid});
    if (!chatroom) {
      this.log(`Bad Request : No such room`)
      return this.over("enterChatRoom");
    }
    if (! await this.chatGatewayService.checkIfcanEnterRoom(user, chatroom, payload.password)) {
      return this.over("enterChatRoom");
    }
    await this.chatGatewayService.enterChatRoom(user, chatroom);
    const room = onlineChatRoomManager.getRoomByid(payload.chatid);
    room.join(socket.id);
    room.announceExceptMe(socket.id, "updateChatRoom", {
      chatid : chatroom.chatid, 
      enterUser : [repo_user.getSimpleInfo(user)]});
    const res = await repo_chatroom.getRoomInfo(chatroom);
    socket.emit("enterChatRoom", res);
    return this.over("enterChatRoom");
  }

  @SubscribeMessage('updateChatRoom')
  async updateChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: UpdateChatRoomDTO) {
    this.log({gate : "updateChatRoom", ...payload});

    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const changer = await repo_chatmember.findOne({member : {userid : socket.userid}, chatroom: {chatid : payload.chatid}});
    if (changer === undefined || changer.position != "owner") {
      console.log("Not authorized");
      this.over("updateChatRoom");
      return {chatid: payload.chatid, result: false};
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
        change["password"] = null;
    }
    if (change.password)
      change["password"] = await this.chatGatewayService.hashing(password);
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
    this.over("updateChatRoom");
  }

  // 채팅방 유저 초대 :
  @SubscribeMessage('inviteChatRoom')
  async inviteChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: InviteChatRoomDTO) {
  this.log({gate : "inviteChatRoom", ...payload});
  return ;
  const repo_chatmember = getCustomRepository(ChatMembershipRepository);
  const repo_user = getCustomRepository(UserRepository);
  const repo_blockList = getCustomRepository(BlockedFriendsRepository);
  const repo_friendList = getCustomRepository(FriendsRepository);
  const repo_chatRoom = getCustomRepository(ChatRoomRepository);
  let chatRoom = await repo_chatRoom.findOne({chatid: payload.chatid});
  if (!await repo_chatmember.findOne({chatroom : {chatid : payload.chatid}, member : {userid : socket.userid}})) {
    this.log("not you exist chatroom");
    return this.over("inviteChatRoom");
  }
  let invitedU = payload.user;
  const user = await repo_user.findOne(socket.userid);
  const room = onlineChatRoomManager.getRoomByid(payload.chatid);
  await Promise.all(invitedU.map(async (userid: string) => {
    let theOther = await repo_user.findOne(userid);
    let res = await Promise.all([
      repo_blockList.amIBlockedBy(user, theOther),
      repo_blockList.didIBlock(user, theOther),
      repo_friendList.isMyFriend(user, theOther)
    ]);
    if (res.findIndex(result=>result===true) !== -1) {
      //Error
      this.over("inviteChatRoom");
    }
    if (await this.chatGatewayService.enterChatRoom(theOther, chatRoom)) {
      chatRoom = await repo_chatRoom.findOne(payload.chatid);
      let friendSocket = onlineManager.socketIdOf(theOther.userid);
      if (friendSocket) {
        room.join(friendSocket);
        const res = await repo_chatRoom.getRoomInfo(chatRoom);
        this.server.to(friendSocket).emit("enterChatRoom", res);
      }
      room.announceExceptMe(friendSocket, "updateChatRoom", {chatid : chatRoom.chatid, enterUser : [repo_user.getSimpleInfo(theOther)]});
      this.over("inviteChatRoom");
    }
  }));
  }

  // 채팅방 나가기
  @SubscribeMessage('exitChatRoom')
  async leaveChat(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: ExitChatRoomDTO) {
    this.log({gate : "exitChatRoom", ...payload});

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
    this.over("exitChatRoom");
    return true;
  }

  // 채팅방 강퇴 :
  @SubscribeMessage('kickChatRoom') 
  async kickChatMember(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: KickChatRoomDTO) {
    this.log({gate : "kickChatRoom", ...payload});

    const repo_chatMember = getCustomRepository(ChatMembershipRepository);
    const kickUser = await repo_chatMember.findOne({chatroom : {chatid : payload.chatid}, member : {userid : payload.userid}});
    const setter = await repo_chatMember.findOne({chatroom : {chatid : payload.chatid}, member : {userid : socket.userid}});
    if (!setter || setter.position === "normal") {
      this.log("Not Authorized");
      this.over("kickChatRoom");
    }
    if (!kickUser || kickUser.position !== "normal") {
      this.log("Can't kick this user");
      this.over("kickChatRoom");
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
    this.over("kickChatRoom");
  }

  // 채팅방 내부 :
  @SubscribeMessage('chatHistory')
  async chatHistory(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: ChatHistoryDTO) {
    this.log({gate : "chatHistory", ...payload});

    if (!payload.chatid) {
      this.log("Bad Reqeust : chatid");
      this.over("chatHistory");
    }
    const repo_chathistory = getCustomRepository(ChatHistoryRepository);
    const lists = await repo_chathistory.bringHistory(socket.historyIndex, payload.chatid);
    const {lastIndex, histories} = repo_chathistory.amugeona(lists);
    if (lastIndex !== -1)
      socket.historyIndex = lastIndex;
    socket.emit("chatHistory", {chatid : payload.chatid, list : histories});
    return this.over("chatHistory");
  }
  

  // 채팅 히스토리 업데이트 : 얼마나 어떻게 보여줄지 (최근 30줄 표시, 스크롤 위로 올리면 30줄씩 업데이트)
  @SubscribeMessage('chatHistoryUpdate')
  async chatHistoryUpdate(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: ChatHistoryUpdateDTO) {
    this.log({gate : "chatHistoryUpdate", ...payload});

    const repo_chathistory = getCustomRepository(ChatHistoryRepository);
    const lists = await repo_chathistory.bringHistory(socket.historyIndex, payload.chatid);
    const {lastIndex, histories} = repo_chathistory.amugeona(lists);
    if (lastIndex !== -1)
      socket.historyIndex = lastIndex;
    socket.emit("chatHistoryUpdate", {chatid : payload.chatid, list : histories});
    this.over("chatHistoryUpadate");
  }

  // 채팅 메세지 :
  @SubscribeMessage('chatMessage')
  async chatMessage(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: ChatMessageDTO) {
    console.log("[chat], ", new Date());
    this.log({gate : "chatMessage", ...payload});
    console.log("[chat0], ", new Date());
    const repo_chathistory = getCustomRepository(ChatHistoryRepository);
    const repo_chatMember = getCustomRepository(ChatMembershipRepository);
    const chatRoom = await getCustomRepository(ChatRoomRepository).findOne({chatid : payload.chatid});
    // const chathistory = await repo_chathistory.find({chatid : chatRoom});
    // 음소거일 경우 못보냄
    // 2명 private 차단리스트 확인.
    // 나머지 전부 보냄.
    if (!payload?.content) {
      this.log("There is no content.");
      return this.over("chatMessage");
    }
    console.log("[chat1], ", new Date());
    const me = await repo_chatMember.findOne({chatroom: {chatid : payload.chatid}, member : {userid : socket.userid}});
    let time = new Date();
    if (!me) {
      this.log("Something Wrong");
      return {chatid:payload.chatid, result:false};
    }
    console.log("[chat2], ", new Date());
    if (me.muteUntil && me.muteUntil > time) {
      this.log("Mute")
      return {chatid:payload.chatid, result:false};
    }
    console.log("[chat3], ", new Date());
    const room = onlineChatRoomManager.getRoomByid(payload.chatid);
    if (chatRoom.type === "private" && chatRoom.memberCount === 2)
      room.sayToRoom(socket, {...payload, time});
    else
      room.announce("chatMessage", {chatid : payload.chatid, userid: socket.userid, content : payload.content, time : time}); 
    console.log("[chat4], ", new Date());
    const temp = await repo_chathistory.insertHistory(socket.userid, {...payload, time}, chatRoom);
    console.log("[chat5], ", new Date());
    this.log(`Message from ${me.member.nickname} has been sent.`);
    this.log(`Message is ${temp.contents} .`);
    console.log("[chat5], ", new Date());
  }

  // 채팅 음소거 :
  @SubscribeMessage('chatMute')
  async chatMute(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: ChatMuteDTO) {
    this.log({gate : "chatMute", ...payload});
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
    this.over("chatMute");
    return true;
  }
}