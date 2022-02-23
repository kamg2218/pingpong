// import { Logger , UseGuards} from '@nestjs/common';
// import { WSAuthGuard } from './ws-guard';
// import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
// import { Server } from 'http';
// import { Socket } from 'socket.io';
// import { getCustomRepository, getRepository } from 'typeorm';
// import { ChatRoomRepository } from 'src/db/repository/ChatRoom.repository';
// import { UserRepository } from 'src/db/repository/User.repository';
// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { IoSocket } from './socket';
// // import { emitter } from './postgres-adapter';


// const options = {
//   cors : {
//     origin : "http://localhost:3000",
//   }
// }

// @UseGuards(WSAuthGuard)
// // @WebSocketGateway(options)
// export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

//   @WebSocketServer()  wss : Server;

//   private ioadapter : IoAdapter;

//   private logger : Logger = new Logger('ChatGateway');
 
//   afterInit(server:Server){
//     this.logger.log("Socket is initalized")
//   }

//   handleDisconnect(client: Socket) {

//     this.logger.log(`Client disconnected : ${client.id}`);
//   }

//   handleConnection(client: IoSocket, ...args: any[]) {
//     this.logger.log(`Client connected : ${client.id}`);
//     client['nickname'] = "jikwon";

//     // console.log("name : ", client.id)
//     // console.log("before : ", client.rooms);
//     // client.join("first room");
//     // console.log("after : ", client.rooms);
//     // console.log("connections : ", this.wss.connections);
//     // console.log()
//     //client.disconnect(true);
//     //this.logger.log(`Client disconceted also`);
//   }

//   @SubscribeMessage('message')
//   async handleMessage(client: IoSocket, payload: any): Promise<WsResponse<object>> {
//     // console.log(payload);
//     // // console.dir(client);
//     // client.join("first room");
//     // console.log("1 : ", client["nickname"])
//     // // console.log(client);
//     // console.log("2 : ", client.nickname)
//     // console.log(client.rooms)
//     // emitter.emit("test", {data : "Wow, test success"}  )
//     const io = this.ioadapter.createIOServer(4242)
    

//     console.log("hi")

//     ///client.emit('message', {data : 'You have sent a message'});
//     // console.log(this.wss.get(_nsps));

//     const repo_room = getCustomRepository(ChatRoomRepository)
//     const user = await getCustomRepository(UserRepository).findOne({nickname : "jikwon"});
//     const new_room = await repo_room.createRoom("first", "private")
//     repo_room.enterRoom(user, new_room);
//     return {event: 'message', data : {text : "Server : " + payload.data}};
//   }

//   @SubscribeMessage('room')
//   createRoom(client : Socket, payload:any) {
//       client.join(payload.data);
//       client.to(payload.data).emit('message', {text : "Join new client"});
//   }
// }