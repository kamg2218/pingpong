import { BadRequestException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WSAuthGuard } from 'src/chat/ws-guard';
import { getCustomRepository, getRepository, Not} from 'typeorm';

import { onlineManager } from './online/onlineManager';
import { UserRepository, BlockedFriendsRepository } from 'src/db/repository/User/UserCustomRepository';
import { AuthSocket } from 'src/type/AuthSocket.interface';
import { User, BlockedFriends } from 'src/db/entity/User/UserEntity';
import { ChatMembershipRepository, ChatBanListRepository, ChatRoomRepository, ChatHistoryRepository } from "src/db/repository/Chat/ChatCustomRepository";
import { ChatMembership, ChatRoom, ChatBanList, ChatHistory } from 'src/db/entity/Chat/ChatEntity';
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
// @UseGuards(AuthGuard('ws-jwt'))
export class ChatGateway {
@WebSocketServer() public server : Server;

  constructor(
    private readonly chatGatewayService : ChatGatewayService
    //private readonly logger : Logger
  ) {}

  @SubscribeMessage('message')
  handleMessage(socket: any, payload: any) : string {
    console.log("message print : ", socket.user)
    // console.log("chat gateway : message")
    socket.emit('message', "chat gateway server message event") 
    throw new WsException("message error")
    return 'Hello world!';
  }

  // @SubscribeMessage('login')
  // handleLogin(@MessageBody() data:{ id: number; channels: number[] }, @ConnectedSocket() socket: Socket) {
  //   const newNamespace = socket.nsp;
  //   console.log('login', newNamespace);
  //   onlineMap[socket.nsp.name][socket.id] = data.id;
  //   newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
  //   data.channels.forEach((channel) => {
    // console.log('join', socket.nsp.name, channel);
    // socket.join(`${socket.nsp.name}-${channel}`);
  // });
  // }

  afterInit(server: Server) : any {
    console.log('websocketserver init');
    onlineChatRoom.init(server);
  }

  // 유저가 참여한 채팅방 조회 : 현재 유저가 참여한 채팅방만 조회
  @SubscribeMessage('myChatRoom')
  async getAllChatByUser(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    // const user = onlineChat[socket.nsp.name][socket.id]
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname});
    // const payload = {userid : user.userid, respond: payload1.respond};

    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const repo_user = getCustomRepository(UserRepository);
    const joinedchat : ChatMembership[] = await repo_chatmember.find({member : user});
    
    let order = [];
    let chatroom = [];

    const chatList = await Promise.all(joinedchat.map(async (element : ChatMembership) => {
      const {chatid, title, type, password} = element.chatroom;
      let members = [];
      // let managers = [];
      let lock = password ? 1 : 0;
      const max = 100 // .env
      const ownerInfo = await repo_chatmember.findOne({where : [{chatroom : element.chatroom}, {position : "owner" }]});
      const owner = ownerInfo.member.userid;

      // // 매니저가 여러명일 경우
      // const repo_chat : ChatMembership[] = await getCustomRepository(ChatMembershipRepository).find({chatroom: element.chatroom});
      // const managerList = repo_chat.map((element : ChatMembership) => {
      //   const manager = element.position;
      //   if (manager != "manager")
      //     return ;
      //   managers.push(element.member.userid);
      // })
      const managers = this.chatGatewayService.managerList(element);

      // 멤버가 여러명일 경우
      const memberInfo = await repo_chatmember.find({chatroom: element.chatroom});
      memberInfo.map((chatmember : ChatMembership) => {
        members.push(repo_user.getSimpleInfo(chatmember.member));
      })
      order.push(element.chatroom.chatid);
      chatroom.push({title, chatid, owner, managers, members, lock, type, max});
    }));
    socket.emit("myChatRoom", {order, chatroom});
  }

  // 전체 채팅방 조회 : 생성되어 있는 전체 채팅방 조회(내가 들어가지 않은 채팅방 + private 제외)
  @SubscribeMessage('publicChatRoom')
  async getAllChat(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    // userid로 내가 없는 채팅방 가져오기
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    // const payload = {userid : user.userid, respond: payload1.respond};

    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const repo_user = getCustomRepository(UserRepository);
    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    const notJoinedChat : ChatMembership[] = await repo_chatmember.find({member: {userid : Not(user.userid)}, chatroom : {type : "public"}});
    // const userInfo = repo_user.getSimpleInfo(user);
    // 지금은 중복됨

    let order = [];
    let chatroom = [];

    const chatList = await Promise.all(notJoinedChat.map(async (element : ChatMembership) => {
      const {chatid, title, type, password} = element.chatroom;
      let members = [];
      let managers = [];
      let lock = password ? 1 : 0;
      const max = 100 // .env
      const ownerInfo = await repo_chatmember.findOne({where : [{chatroom : element.chatroom}, {position : "owner" }]});
      const owner = ownerInfo.member.userid;
      
      // 매니저가 여러명일 경우
      const repo_chat : ChatMembership[] = await repo_chatmember.find({chatroom: element.chatroom, position:"manager"});
      repo_chat.map((chatmember : ChatMembership) => {
        managers.push(chatmember.member.userid);
      })

      // 멤버가 여러명일 경우
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
  // chatroom, ChatMembership 추가
  @SubscribeMessage('createChatRoom')
  async createchat(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname});
    const payload = {userid : user.userid, respond: payload1.respond, member : payload1.member, type:payload1.type, title:payload1.title, password:payload1.password};

    let member =[];
    // chatroom db 저장
    // 이미 로그인 되어있는가? -> check : onlineManager.isOnline(user.userid)
    if (!this.chatGatewayService.isLogin(user))
      return false;


    
    /* check : 생성 가능한지 먼저 조건 확인 필요 */
    const chatroomInfo = await this.chatGatewayService.createChatRoom(payload, user);
   
    this.chatGatewayService.createowner(payload, user, chatroomInfo);

    payload.member?.map(async (userid : string) => {
      // 초대한 멤버가 나를 차단했는가? //
      // member의 프로필 닉 유저아이디 가져와서 객체로만들기
      const repo_user = getCustomRepository(UserRepository);
      const mem = await repo_user.findOne({userid : userid});
      member.push(repo_user.getSimpleInfo(mem));
      // chatnmembership에 db 저장
      this.chatGatewayService.createmember(mem, chatroomInfo);  //
    })

    let chatid = chatroomInfo.chatid;
    
    /* check */
    // let title;
    // if (chatroomInfo.title === null)
    //   title = "";
    // else
    //   title = chatroomInfo.title;
    let title = chatroomInfo?.title ? chatroomInfo.title : "";
    /* --------- */
    
    let lock = chatroomInfo.password ? 1 : 0;
    if (lock === 1) {
      if (chatroomInfo.password.length != 4)
        return ;
      if (chatroomInfo.type === "private")
        lock = 0;
        // password 무시
    }
    let owner = user.userid;
    // let owner = (await getCustomRepository(ChatMembershipRepository).findOne({position:"owner"})).member.userid;
    let managers =[];
    let type = chatroomInfo.type;

    const newRoom = onlineChatRoomManager.create(chatid);
    newRoom.join(socket);
    socket.emit("createChatRoom", {chatid, title, member, lock, owner, managers, type});
    return true;
  }
  

  // 채팅방 입장
  @SubscribeMessage('enterChatRoom')
  async enterChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    // user = onlineChat[socket.nsp.name][socket.id]
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname});
    const payload = {userid : user.userid, respond: payload1.respond, chatid: payload1.chatid, password:payload1.password};
    // public일 경우 admin이 나를 banPublicChat에 등록했나?

    if (!this.chatGatewayService.isLogin(user))
      return false;

    // ban되어있는지 확인(chatBanList)
    const repo_chatroom = await getCustomRepository(ChatRoomRepository);
    const chatroom = await repo_chatroom.findOne({chatid: payload.chatid});
    const banList = await getCustomRepository(ChatBanListRepository).findOne({chatid: chatroom, userid: user});
    // private방에 초대되었는가?
    if (chatroom.type === "private")
      return false;
    if (banList)
      return false; // 채팅방 못들어감
    const repo_chatMember = getCustomRepository(ChatMembershipRepository);
    // 방이 존재하는지
    if (chatroom === undefined)
      return false;
    // 이미 채팅방에 입장되어있을 경우
    if (await repo_chatMember.findOne({chatroom : chatroom, member : user}))
      return false;
    // 패스워드 맞는지
    let lock;
    if (chatroom.password === null) {
      lock = false; 
    }
    else {
      if (chatroom.password != payload.password) {
        throw new BadRequestException("password error");
      }
      lock = true;
    }
    // 4. 정원초과
    if (chatroom.memberCount === 100)
      return false; // 정원 초과
    
    // 따로 함수 빼두기..
    let chatMember;
    let manager = [];
    let members = [];
    let memberinfo = {};
    let owner;
    // const chatRoomInfo = repo_ChatMember.map(async (element : ChatMembership) => {
    //   const chatRoomInfo = await getCustomRepository(ChatRoomRepository).findOne({chatid :payload.chatid});
    //   if (chatRoomInfo === undefined)
    //     return ;
    //   if (element.chatid != payload1.chatid)
    //     return ;
    //   const userid = element.userid;
    //   const nick = element.nickname;
    //   const profile = element.profile;
    //   memberinfo = {userid, nick, profile};
    //   members.push(memberinfo);
    //   if (element.position === "owner")
    //     const owner = element.userid;
    //   else if (element.position === "manager")
    //     manager.push(userid);
    // }
    // 
    for (let count = 0; count < chatroom.memberCount; count++)
    {
      chatMember = await repo_chatMember.findOne({index : count});
      if (chatMember === undefined)
        continue ;
      const userid = chatMember.userid;
      const nick = chatMember.nickname;
      const profile = chatMember.profile;
      memberinfo = {userid, nick, profile};
      members.push(memberinfo);
      if (chatMember.position === "owner") {
        owner = userid; // 되는지 확인
      }
      else if (chatMember.position === "manager") {
        manager.push(userid);
      }
    }
    const my = await getCustomRepository(UserRepository).findOne({userid : payload.userid});
    const userid = my.userid;
    const nick = my.nickname;
    const profile = my.profile;
    memberinfo = {userid, nick, profile};
    members.push(memberinfo);

    // 채팅방 입장 online으로 변경
    this.chatGatewayService.enterChatRoom(socket, user, chatroom);
    const room = onlineChatRoomManager.getRoomByid(payload.chatid);
    room.join(socket);
    // 채팅방 정보 변경 (유저 1명 -> member, count)
    const chatid = chatroom.chatid;
    const title = chatroom.title;
    const mode = chatroom.type;
    socket.emit("enterChatRoom", {chatid, title, members, lock, owner, manager, mode});
  }

  // 채팅방 정보 변경 :
  @SubscribeMessage('updateChatRoom')
  async updateChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    const payload = {userid : user.userid, respond: payload1.respond, chatid: payload1.chatid, addManager:payload1.addManager, deleteManager:payload1.deleteManager, 
      title : payload1.title, type : payload1.type, lock : payload1.lock, password : payload1.password };

    // 이미 로그인 되어있는가?
    if (!this.chatGatewayService.isLogin(user))
      return false;
    console.log("error");
    // 채팅방에 속해있는가?, 소유자인가?
    let repo_chatroom = getCustomRepository(ChatRoomRepository);
    let changeRoomInfo = await repo_chatroom.findOne({chatid : payload.chatid});
    const changer = await getCustomRepository(ChatMembershipRepository).findOne({member : user, chatroom: changeRoomInfo});
    console.log("error1");
    if (changer === undefined || changer.position != "owner") {
      // throw new BadRequest("변경할 수 없습니다.");
      console.log("error2");
      return false;
    }
    console.log("error3");
    let lock = payload.password ? true : false;
    let manager = [];
    let repo_chatmember = getCustomRepository(ChatMembershipRepository)
    console.log("error4");
    // changeRoomInfo.memberCount;

    // error!!!!!!!!!! length 안되고 다른거 써야함
    // 매니저 추가
    if (payload.addManager.length === 0)
      console.log("no one")
    for (let i = 0; i < payload.addManager.length; i++) {
      console.log("error5");
      manager.push(payload.addManager[i]);
      let m = await getCustomRepository(UserRepository).findOne({userid: payload.addManager[i]});
      let userInfo = await repo_chatmember.findOne({chatroom: changeRoomInfo, member : m});
      userInfo.position = "manager";
      repo_chatmember.update(userInfo.index, {position: "manager"});  // DB 변경

    }
    console.log("error6");
    // 매니저 제거
    let managers = [];
    let managerInfo = await getCustomRepository(ChatMembershipRepository).find({chatroom: changeRoomInfo, position: "manager"});
    for (let j = 0; j < payload.deleteManager.length; j++) {
      for (let i = 0; i < managerInfo.length; i++) {
        if (managerInfo[i] === payload.deleteManager[j]) {
          managerInfo[i].position = "normal";
          repo_chatmember.update(managerInfo[i].index, {position: "normal"}); // DB 변경
          managerInfo.splice(i, 1);
          i--;
        }
      }
    }      
    // 나간 유저 확인 -> 소켓으로?
    // 들어온 유저 확인

    // 채팅방 정보 변경
    // {chatid, title, lock, type, addManager, deleteManager, enterUser, exitUser}
    // enterUser = [{userid, profile, nick}];
    // 유저가 들어온 경우도?
    console.log("error7");
    changeRoomInfo.chatid = payload.chatid;
    if (payload.title.length < 16)
      changeRoomInfo.title = payload.title;
    if (!(changeRoomInfo.type === "private" && changeRoomInfo.password != null))
      changeRoomInfo.password = payload.password;
    changeRoomInfo.type = payload.type;
    
    // Chatroom DB정보 변경, membercount, membership은 어케?
    repo_chatroom.update(changeRoomInfo.chatid, {title: changeRoomInfo.title, type: changeRoomInfo.type, password:changeRoomInfo.password})
    // socket.emit("updateChatRoom", changeRoomInfo.chatid,changeRoomInfo.title, lock, changeRoomInfo.type, addManager, deleteManager, enterUser, exitUser);
    // 채팅방 유저들에게 정보 전달
  }

  // 채팅방 유저 초대 : 
  @SubscribeMessage('inviteChatRoom') 
  async inviteChatRoom(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
  const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname});
  const chatRoomx = await getCustomRepository(ChatRoomRepository).findOne({title : payload1.title})
  const payload = {userid : user.userid, respond: payload1.respond, user : [], chatid: chatRoomx.chatid};
  await Promise.all(payload1.user.map(async (nickname : string) => {
    let theother = await getCustomRepository(UserRepository).findOne({nickname: nickname});
    if (theother)
      payload.user.push(theother.userid);
  }));
  // 친구목록에 없는 경우
  // 유저 차단이 되어있는 경우
  const repo_chatmember = getCustomRepository(ChatMembershipRepository);
  const repo_user = getCustomRepository(UserRepository);
  const repo_blockList = getCustomRepository(BlockedFriendsRepository);
  const chatRoom = await getCustomRepository(ChatRoomRepository).findOne({chatid: payload.chatid});
  const ownerInfo = await repo_chatmember.findOne({chatroom: chatRoom, position: "owner"});
  const owner = ownerInfo.member.userid;
  let lock = chatRoom.password ? 1 : 0;
  console.log("error")

  // const blockListme = repo_blockList.find({block: user});
  let addmembernum = 0;
	let members = [];
	let managers = []
  let invitedU = payload.user;
  invitedU.map(async (userid: string) => {
    console.log("error1")
    let theOther = await repo_user.findOne(userid);
    if (await repo_blockList.amIBlockedBy(user, theOther)) {
      console.log("blocked");
      //error     // 차단되서 초대 못함
    }
    else {
      // chatroom에 정원 초과라면c
      if (chatRoom.memberCount === 100) { // 초대 못함
        console.log('max member count')
      }
      else {
        // 초대가 되었으면 chatmembership에 insert하기
        console.log("trying to insert")
        const inviteUser = await repo_user.findOne(userid);
        this.chatGatewayService.createmember(inviteUser, chatRoom);
        addmembernum++;
        members.push();
      }
    }
        
  })
  // managers.push();
  console.log("error2")
	// chatroom 업데이트
  const chatid = payload.chatid;
  const changeChatRoom = {
    title : chatRoom.title,
    type : chatRoom.type,
    memberCount : chatRoom.memberCount + addmembernum
  }
  let repo_chatroom = getCustomRepository(ChatRoomRepository);
  repo_chatroom.update(chatid, changeChatRoom);
console.log("error3")


  const chatmember : ChatMembership[] = await repo_chatmember.find({chatroom: {chatid : chatRoom.chatid}, position:"manager"});
  const managerList = chatmember.map((element : ChatMembership) => {
	  managers.push(element.member.userid);
  })

  socket.emit("inviteChatRoom", chatid, changeChatRoom.title, members, lock, owner, managers, changeChatRoom.type);
  
  }

  // 채팅방 나가기 :
  @SubscribeMessage('exitChatRoom')
  async leaveChat(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    const payload = {userid : user.userid, respond: payload1.respond, chatid: payload1.chatid};

    // 이미 로그인 되어있나?
    if (!this.chatGatewayService.isLogin(user))
      return false;

    // 채팅방에 들어가있지 않는 경우
    const repo_chatmember = getCustomRepository(ChatMembershipRepository);
    const repo_chatroom = getCustomRepository(ChatRoomRepository);
    const chatroom = await repo_chatroom.findOne({chatid: payload.chatid});
    const findUser = await getCustomRepository(UserRepository).findOne({userid: payload.userid})
    const chatUser = await repo_chatmember.findOne({chatroom:chatroom, member:findUser})
	if (chatUser) {
      // error
    }
  if (chatroom.memberCount === 1) {
    // 채팅방 폭파
    repo_chatroom.delete(payload.chatid);
    return ;
  }
  if (chatUser.position == "owner") {
	// 채널 소유자가 나간 경우
	// 있으면 가장 오래된 관리자에게 위임
	  const managers = await getCustomRepository(ChatMembershipRepository).find({chatroom:chatroom, position:"manager"});
		let changeManager;
		// 매니저가 없을 경우
		if (managers.length === 0) {
			// 채팅방 폭파
      repo_chatroom.delete(payload.chatid);
		}
		// 매니저에게 권한 위임
		else {
			for (let i = 0; i < managers.length - 1; i++) {
				if (managers[i].enterDate < managers[i+1].enterDate)
					changeManager = managers[i];
				else {
					changeManager = managers[i+1];
				}
			}
		}
		// changeManager를 관리자로 변경(db 변경)
    repo_chatmember.update(changeManager.index, {position: "owner"});
		// updateChatRoom을 해줘야하는건가..
    }
	else {
		// 소유자가 아니라면 그냥 나감
		// socket.leave();
	}
    // chatroom 정보 변경(updatechatroom)
    // const chatmember = getCustomRepository(ChatMembershipRepository).findOne({userid})
  }

  // 채팅방 강퇴 :
  @SubscribeMessage('kickChatRoom') 
  async kickChatMember(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    const payload = {userid : user.userid, respond: payload1.respond, chatid: payload1.chatid};

    // 오너가 아닌 경우
    const repo_chatMember = getCustomRepository(ChatMembershipRepository);
	  const chatroom = await getCustomRepository(ChatRoomRepository).findOne({chatid: payload.chatid});
	  const chatuser = await getCustomRepository(UserRepository).findOne({userid: payload.userid});
    const kickUser = await getCustomRepository(ChatMembershipRepository).findOne({chatroom : chatroom, member : chatuser});
    const setter = await repo_chatMember.findOne({member : user});
    if (setter.position === "normal") {
    //   throw new BadRequest("소유자가 아니라 강퇴할 수 없습니다.");
    }
    // 매니저가 매니저를 강퇴한경우
    if (setter.position === "manager" && (kickUser.position === "manager" || kickUser.position === "owner")) {
    //   throw new BadRequest("관리자를 강퇴할 수 없습니다.");
    }
    // db(ChatMembership)에서 유저 제거, 채팅 벤리스트에 추가
    repo_chatMember.delete(kickUser.index);  // 확인
    // socket.emit("kickChatRoom", {payload.chatid, payload.userid})
    // 강퇴당한 본인 - kickChatRoom
    // 나머지 - updateChatRoom
    // chatmembership delete, chatroom 인원 -1
    // socket.emit("updateChatRoom", )
  }

  // 채팅방 내부 :
  @SubscribeMessage('chatHistory')
  async chatHistory(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    const payload = {userid : user.userid, respond: payload1.respond, chatid: payload1.chatid};

    let list = [];
    // {userid, contents};

    const repo_chatHistory : ChatHistory[] = await getCustomRepository(ChatHistoryRepository).find({chatid: payload.chatid});
    const chatList = repo_chatHistory.map(async (element : ChatHistory) => {
      const contents = element.contents;
      const userid = element.userid;
      list.push({userid, contents});
    })
    // socket.emit("chatHistory", list)
  }
  

  // 채팅 히스토리 업데이트 : 얼마나 어떻게 보내줄지 보류
  @SubscribeMessage('chatHistoryUpdate')
  async chatHistoryUpdate(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    const payload = {userid : user.userid, respond: payload1.respond, chatid: payload1.chatid};

    let list = []; //{userid, contents, date}
    const chatid = payload.chatid;

    const repo_chatHistory : ChatHistory[] = await getCustomRepository(ChatHistoryRepository).find({chatid: payload.chatid});
    const chatList = repo_chatHistory.map(async (element : ChatHistory) => {
      const contents = element.contents;
      const userid = element.userid;
      list.push({userid, contents});
    })
    // socket.emit("chatHistoryUpdate", {chatid, list});
    // chathistory insert 하기 ??
  }

  // 채팅 메세지 :
  @SubscribeMessage('chatMessage')
  async chatMessage(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    const payload = {respond: payload1.respond, contents: payload1.contents, chatid: payload1.chatid};

    const chatRoom = await getCustomRepository(ChatRoomRepository).findOne({chatid : payload.chatid});
    const userInfo = await getCustomRepository(UserRepository).findOne({userid : user.userid});
    const chatmember = await getCustomRepository(ChatMembershipRepository).findOne({member: userInfo});
    const repo_blocklist = getCustomRepository(BlockedFriendsRepository);
    // 
    // public인지 private인지 확인
    if (chatRoom.type === "public") {
      // 음소거일 경우 못보냄
      // 채팅 방에 전체에게 보내기
    }
    else {
      // 음소거일 경우 못보냄?, 차단당했을 경우 못보냄
    }
      
    
    const chatmembers : ChatMembership[] = await getCustomRepository(ChatMembershipRepository).find({chatroom: chatRoom});
    // const res = chatmembers.map(async (element: ChatMembership) => {
      const res = chatmembers.map(async (element: ChatMembership) => {
        const chatid = payload.chatid;

        // mute chatroom
        if (element.muteUntil)
        // return {chatid, false};
        // 못보냄
        
        // block list user(private이면 못보냄)
        if (chatRoom.type === "private") {
          const receiver = await getCustomRepository(BlockedFriendsRepository).find({me : element.member});
        }
        // if (receiver.findOne({block: user}) != undefined) {
        //   // return {chatid, false};
        // }
        // else {
        //   // return {chatid, userid, contents};
        // }
      }) 
  }

  // 채팅 음소거 :
  @SubscribeMessage('chatMute')
  async chatMute(@ConnectedSocket() socket: AuthSocket, @MessageBody() payload1: any) {
    const user = await getCustomRepository(UserRepository).findOne({nickname: payload1.myNickname})
    const payload = {userid : user.userid, respond: payload1.respond, contents: payload1.contents, chatid: payload1.chatid, time: payload1.time};

    // 관리자가 아닌 경우, owner에게 했을 경우, 관리자가 관리자에게 했을 경우
    const repo_chatMember = await getCustomRepository(ChatMembershipRepository);
    const userInfo = await getCustomRepository(UserRepository).findOne({userid: user.userid});
    const opponentInfo = await getCustomRepository(UserRepository).findOne({userid: payload.userid});
    const chatmember = await repo_chatMember.findOne({member: userInfo});
    const chatRoom = await getCustomRepository(ChatRoomRepository).findOne({chatid: payload.chatid});

    const manager = await repo_chatMember.findOne({chatroom: chatRoom, member: userInfo});
    const muteMember = await repo_chatMember.findOne({chatroom: chatRoom, member: opponentInfo});
    if (manager.position === "normal")
      // return {payload.chatid, false};
    if (muteMember.position !== "normal")
      // return {payload.chatid, false};
    // muteMember.muteUntil = payload.time;
    repo_chatMember.update(muteMember.index, {muteUntil: payload.time});
  }
}