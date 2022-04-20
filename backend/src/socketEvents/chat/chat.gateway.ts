import { Logger, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { getCustomRepository } from 'typeorm';
import { onlineManager } from '../online/onlineManager';
import { UserRepository, BlockedFriendsRepository, FriendsRepository } from 'src/db/repository/User/UserCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { ChatMembershipRepository, ChatRoomRepository, ChatHistoryRepository } from "src/db/repository/Chat/ChatCustomRepository";
import { ChatRoom } from 'src/db/entity/Chat/ChatEntity';
import { ChatGatewayService } from './chatGateway.service';
import { onlineChatRoom } from '../online/onlineChatRoom';
import { onlineChatRoomManager } from '../online/onlineChatRoomManager';
import { ChatHistoryDTO, ChatHistoryUpdateDTO, ChatMessageDTO, ChatMuteDTO, CreateChatRoomDTO, EnterChatRoomDTO, ExitChatRoomDTO, InviteChatRoomDTO, KickChatRoomDTO, UpdateChatRoomDTO } from './dto/chat.dto';
import { WsGuard } from '../ws.guard';
import { CORS_ORIGIN } from 'src/config/url';
import { Emitter } from '../auth/emitter';

const options = {
  cors : {
      origin : ["https://admin.socket.io"],
      credentials : true,
  }
}

// @WebSocketGateway({namespace: /\/ws-.+/}) // 정규표현식
@WebSocketGateway(options)
@UseGuards(WsGuard)
export class ChatGateway {
@WebSocketServer() public server : Server;

  constructor(
    private readonly chatGatewayService : ChatGatewayService,
    private readonly logger : Logger,
  ) {}
	private readonly emitter = new Emitter(this);
  
  afterInit(server: Server) : any {
    onlineChatRoom.init(server);
  }
  
  private log(msg : any) {
    this.logger.log(msg, "UserGateway");
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
    this.emitter.emit(socket, "myChatRoom", {order, chatroom});
  }

  // 전체 채팅방 조회 : 생성되어 있는 전체 채팅방 조회(내가 들어가지 않은 채팅방 + private 제외)
  @SubscribeMessage('publicChatRoom')
  async getAllChat(@ConnectedSocket() socket: AuthSocket) {
    this.log({gate : "publicChatRoom"});

    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    const myChatroomList : ChatRoom[] = await repo_chatmember.getMyChatRoom(socket.userid);
    const publicChatroomList = await repo_chatroom.find({
      where : {type : "public"},
      order : {title : "ASC"}
    });
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
    this.emitter.emit(socket, "publicChatRoom", {order, chatroom});
    return ;
  }


  // 채팅방 만들기
  @SubscribeMessage('createChatRoom')
  async createchat(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: CreateChatRoomDTO) {
    this.log({gate : "createChatRoom", ...payload});

    const repo_user = getCustomRepository(UserRepository);
    const user = await repo_user.findOne(onlineManager.userIdOf(socket.id));
    let members =[];
    const repo_chatroom = getCustomRepository(ChatRoomRepository);

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
    return ;
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
      this.log(`Bad Request : No such room`);
      return ;
    }
    if (! await this.chatGatewayService.checkIfcanEnterRoom(user, chatroom, payload.password)) {
      this.log(`${user.nickname} can't enter chatroom`);
      return ;
    }
    await this.chatGatewayService.enterChatRoom(user, chatroom);
    const room = onlineChatRoomManager.getRoomByid(payload.chatid);
    room.join(socket.id);
    room.announceExceptMe(socket.id, "updateChatRoom", {
      chatid : chatroom.chatid, 
      enterUser : [repo_user.getSimpleInfo(user)]});
    const res = await repo_chatroom.getRoomInfo(chatroom);
    this.emitter.emit(socket,"enterChatRoom", res);
    return ;
  }

  @SubscribeMessage('updateChatRoom')
  async updateChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: UpdateChatRoomDTO) {
    this.log({gate : "updateChatRoom", ...payload});

    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const changer = await repo_chatmember.findOne({member : {userid : socket.userid}, chatroom: {chatid : payload.chatid}});
    if (changer === undefined || changer.position != "owner") {
      console.log("Not authorized");
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
    let room = await getCustomRepository(ChatRoomRepository).findOne({chatid : payload.chatid});
    if (change.password && room.type === "public") {
      change["lock"] = room.password ? true : false;
    }
    if (addManagerList && addManagerList.length)
      change["addManager"] = addManagerList;
    if (deleteManagerList && deleteManagerList.length)
      change["deleteManager"] = deleteManagerList;
    delete change[password];
    onlineChatRoomManager.getRoomByid(payload.chatid).announce("updateChatRoom", {...change, "chatid" : payload.chatid});
    return ;
  }

  // 채팅방 유저 초대 :
  @SubscribeMessage('inviteChatRoom')
  async inviteChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: InviteChatRoomDTO) {
  this.log({gate : "inviteChatRoom", ...payload});
  const repo_chatmember = getCustomRepository(ChatMembershipRepository);
  const repo_user = getCustomRepository(UserRepository);
  const repo_blockList = getCustomRepository(BlockedFriendsRepository);
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
    ]);
    if (res.findIndex(result=>result===true) !== -1) {
      return ;
    }
    if (await this.chatGatewayService.enterChatRoom(theOther, chatRoom)) {
      chatRoom = await repo_chatRoom.findOne(payload.chatid);
      let friendSocket = onlineManager.socketIdOf(theOther.userid);
      if (friendSocket) {
        room.join(friendSocket);
        const res = await repo_chatRoom.getRoomInfo(chatRoom);
        this.emitter.emitById(friendSocket, "enterChatRoom", res);
      }
      room.announceExceptMe(friendSocket, "updateChatRoom", {chatid : chatRoom.chatid, enterUser : [repo_user.getSimpleInfo(theOther)]});
      return ;
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
    room.announce("updateChatRoom", {exitUser : [socket.userid],"chatid" : payload.chatid });
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
  async kickChatMember(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: KickChatRoomDTO) {
    this.log({gate : "kickChatRoom", ...payload});

    const repo_chatMember = getCustomRepository(ChatMembershipRepository);
    const kickUser = await repo_chatMember.findOne({chatroom : {chatid : payload.chatid}, member : {userid : payload.userid}});
    const setter = await repo_chatMember.findOne({chatroom : {chatid : payload.chatid}, member : {userid : socket.userid}});
    if (!setter || setter.position === "normal") {
      this.log("Not Authorized");
      return ;
    }
    if (!kickUser || kickUser.position !== "normal") {
      this.log("Can't kick this user");
      return ;
    }
    let exitUser = [kickUser.member.userid];
    await this.chatGatewayService.kickUserFromChatRoom(kickUser.member, payload.chatid);
    let room = onlineChatRoomManager.getRoomByid(payload.chatid);
    let socketid = onlineManager.socketIdOf(kickUser.member.userid);
    if (socketid) {
      room.leave(socketid);
      this.emitter.emitById(socketid, "kickChatRoom", {chatid : payload.chatid});
    }
    room.announce("updateChatRoom", {exitUser});
    this.log(`${setter.member.nickname} kicked ${kickUser.member.nickname}`);
    return ;
  }

  // 채팅방 내부 :
  @SubscribeMessage('chatHistory')
  async chatHistory(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: ChatHistoryDTO) {
    this.log({gate : "chatHistory", index :socket.historyIndex, ...payload});

    if (!payload.chatid) {
      this.log("Bad Reqeust : chatid");
      return ;
    }
    const repo_chathistory = getCustomRepository(ChatHistoryRepository);
    const lists = await repo_chathistory.bringHistory(0, payload.chatid);
    const {lastIndex, histories} = repo_chathistory.refineHistory(lists);
    if (lastIndex !== -1)
      socket.historyIndex = lastIndex;
    console.log("Lst index : ", lastIndex);
    this.emitter.emit(socket, "chatHistory", {chatid : payload.chatid, list : histories});
    return ;
  }
  

  // 채팅 히스토리 업데이트 : 얼마나 어떻게 보여줄지 (최근 30줄 표시, 스크롤 위로 올리면 30줄씩 업데이트)
  @SubscribeMessage('chatHistoryUpdate')
  async chatHistoryUpdate(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload: ChatHistoryUpdateDTO) {
    this.log({gate : "chatHistoryUpdate", index :socket.historyIndex, ...payload});

    const repo_chathistory = getCustomRepository(ChatHistoryRepository);
    const lists = await repo_chathistory.bringHistory(socket.historyIndex, payload.chatid);
    const {lastIndex, histories} = repo_chathistory.refineHistory(lists);
    if (lastIndex !== -1)
      socket.historyIndex = lastIndex;
    this.emitter.emit(socket, "chatHistoryUpdate", {chatid : payload.chatid, list : histories});
    return ;
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
    // 음소거일 경우 못보냄
    // 2명 private 차단리스트 확인.
    // 나머지 전부 보냄.
    if (!payload?.contents) {
      this.log("There is no content.");
      return ;
    }
    console.log("[chat1], ", new Date());
    const me = await repo_chatMember.findOne({chatroom: {chatid : payload.chatid}, member : {userid : socket.userid}});
    let time = new Date();
    if (!me) {
      this.log("Something Wrong");
      return {chatid:payload.chatid, result:false};
    }
    if (me.muteUntil && me.muteUntil > time) {
      this.log("Mute");
      return false;
    }
    let isNeed = false;
    const room = onlineChatRoomManager.getRoomByid(payload.chatid);
    if (chatRoom.type === "private" && chatRoom.memberCount === 2) {
      console.log("room type1");
      isNeed = await room.sayToRoom(socket, {...payload, time});
    }
    else {
      console.log("room type2");
      isNeed = room.announce("chatMessage", {chatid : payload.chatid, userid: socket.userid, contents : payload.contents, createDate : time}); 
    }
    if (isNeed)
      await repo_chathistory.insertHistory(socket.userid, {...payload, time}, chatRoom);
    
    return true;
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
    if (time < other.muteUntil)
      return true;
    await repo_chatMember.update(other.index, {muteUntil: time});
    this.log(`${other.member.nickname} is muted until ${time}`);
    return true;
  }
}