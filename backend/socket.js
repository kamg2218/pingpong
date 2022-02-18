const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const {makeCode, verifiedCode} = require('./qrcode');

let myChatRoom = {
    order: ['1232', '1233424'],
    chatroom: [{chatid:'1232', title:'', manager:['123223'], members:[{userid: '2535', nickname:'second_user', profile:2}], owner:'123223', lock: false, max:10, type: "private"}, {chatid:'1233424', title:'', manager:['2535'], members:[{userid: '2535', nickname:'third_user', profile:2}], owner:'2535', lock: false, max:10, type: "private"}]
}
let userInfo = {
    id: "123223",
    nickname: "first_user",
    win: 3,
    lose: 2,
    profile: 1,
    level: "",
    levelpoint: 0,
    levelnextpoint: 100,
    friends: [{userid:'121', nickname: 'first', profile: 1, onoff: true}, {userid:'122', nickname: 'second', profile: 2, onoff: false}, {userid:'112', nickname: 'third', profile: 0, onoff: false},{userid:'111', nickname: 'forth', profile: 3, onoff: false},{userid:'101', nickname: 'fifth', profile: 4, onoff: false}, {userid:'2232', nickname: 'se3th', profile: 4, onoff: false}, {userid:'4253', nickname: 'fisdkesh', profile: 1, onoff: false}],
    newfriends: [{userid:'1211111', nickname: 'newbie', profile: 2, onoff: false}],
    blacklist: [],
    qrcode: '',
    twofactor: true,
}
let chatMessage = [
    {chatid: '1232', list:[{userid: '123223', content: "hello, nice to meet you!"}, {userid: '2535', content: "I'm in!"}, {userid: '123223', content: "I'm out!"},{userid: '123223', content: "hello, nice to meet you!"}, {userid: '2535', content: "I'm in!"}, {userid: '123223', content: "I'm out!"},{userid: '123223', content: "hello, nice to meet you!"}, {userid: '2535', content: "I'm in!"}, {userid: '123223', content: "I'm out!"}]},
    {chatid:'1233424', list:[]}
]
let publicChatRoom = {
    order: ['1222', '18473', '18474', '18475', '18476'],
    chatroom: [
         {title: 'first_room', chatid:'1222', owner:'183472', manager:['183472'], members:[{userid: '183472', nickname: 'hihihi', profile: 5}], lock: false, type: 'public', max:10},
         {title: 'second_room', chatid:'18473', owner:'1899472', manager:['1899472'], members:[{userid: '1899472', nickname: 'hhelllo', profile: 3}], lock: true, type: 'public', max:100},
         {title: 'second_room', chatid:'18474', owner:'1899472', manager:['1899472'], members:[{userid: '1899472', nickname: 'hhelllo', profile: 3}], lock: true, type: 'public', max:100},
         {title: 'second_room', chatid:'18475', owner:'1899472', manager:['1899472'], members:[{userid: '1899472', nickname: 'hhelllo', profile: 3}], lock: true, type: 'public', max:100},
         {title: 'second_room', chatid:'18476', owner:'1899472', manager:['1899472'], members:[{userid: '1899472', nickname: 'hhelllo', profile: 3}], lock: true, type: 'public', max:100}
     ]
 }

module.exports = function(io){
    console.log("socket starts!");

    io.on("connection", (socket)=>{
        socket["nickname"] = "anonymous";
        socket["profile"] = 1;
        socket["onoff"] = true;

        socket.onAny((event)=>{
            // console.log(io.sockets.adapter);
            console.log(`Socket Event: ${event}`);
        });
        socket.on("userInfo", ()=>{
            console.log("User Info is emitted!");
            socket.emit("userInfo", userInfo);
        });
        //Friends
        socket.on("newFriend", (msg)=>{
            console.log(msg.result);
            if (msg.result === true){
                //a
                socket.emit("addFriend", {
                    "userid": msg.userid,
                    "nickname": "NewFriend",
                    "profile": 4,
                    "onoff": false,
                });
                userInfo.friends.push({
                    userid: msg.userid, nickname: 'NewFriend', profile: 4, onoff: false
                });
                // done();
                //b
                // socket.to(msg.userid).emit("newFriend", {
                //     "userid": socket,
                //     "nickname": socket.nickname,
                //     "profile": socket.profile,
                //     "onoff": socket.onoff,
                // });
            }
        });
        socket.on("addFriend", (msg)=>{
            socket.to(msg.userid).emit("addFriend", {
                "userid": socket,
                "nickname": socket.nickname,
                "profile": socket.profile,
                "onoff": socket.onoff,
            });
        });
        socket.on("deleteFriend", (msg)=>{
            socket.emit("deleteFriend", {"userid": msg.userid});
            userInfo.friends.filter(p=>p.userid !== msg.userid);
        });
        socket.on("blockFriend", (msg)=>{
            socket.emit("deleteFriend", {"userid": msg.userid});
            socket.emit("blockFriend", {
                "userid": msg.userid,
                "nickname": "blocked",
                "profile": 2,
            });
            userInfo.blacklist.push(msg.userid);
        });
        socket.on("unblockFriend", (msg)=>{
            console.log("Unblocked!");
            userInfo.blacklist.filter(p=>p !== msg.userid);
        });
        socket.on("opponentProfile", (msg)=>{
            console.log("opponent profile");
            socket.emit("opponentProfile", {
                userid: msg.userid,
                nickname: "first friend",
                win: 1,
                lose: 3,
                profile: 3,
                level: "hi",
                history: [{nick: "first", profile:2, winner:"1212"}, {nick: "second", profile:2, winner:"2948"}, {nick: "third", profile:4, winner:"1212"}, {nick: "forth", profile:6, winner:"123432"}, {nick: "abcd", profile:4, winner:"1212"}, {nick: "fifth", profile:6, winner:"123432"}],
                block: false,
                friend: true
            });
        })
        //Chat
        socket.on("myChatRoom", ()=>{
            console.log('my chat room!');
            socket.emit("myChatRoom", myChatRoom);
        });
        socket.on("createChatRoom", (msg, done)=>{
            socket.join(msg.title);
            socket.to(msg.title).emit("welcome", socket.nickname);
            done(true);
        });
        socket.on("enterChatRoom", (msg)=>{
            socket.join(msg.title);
            socket.to(msg.title).emit("welcome", socket.nickname);
        });
        socket.on("chatHistory", (msg)=>{
            let history = chatMessage.find((m)=> m.chatid === msg.chatid);
            // chatMessage.map((m)=>{console});
            socket.emit("chatHistory", history);
        })
        socket.on("updateChatRoom", (msg)=>{
            let variable = {};
            const idx = myChatRoom.order.findIndex(msg.chatid);

            variable.chatid = msg.chatid;
            if (msg.title){
                variable.title = msg.title;
                myChatRoom.chatroom[idx].title = msg.title;
            }
            if (msg.type){
                variable.type = msg.type;
                myChatRoom.chatroom[idx].type = msg.type;
            }
            if (msg.lock){
                variable.lock = msg.lock;
                myChatRoom.chatroom[idx].lock = msg.lock;
            }
            if (msg.password){
                variable.password = msg.password;
                myChatRoom.chatroom[idx].password = msg.password;
            }
            if (msg.addManager){
                variable.addManager = msg.addManager;
                myChatRoom.chatroom[idx].addManager = msg.addManager;
            }
            if (msg.deleteManager){
                variable.deleteManager = msg.deleteManager;
                myChatRoom.chatroom[idx].deleteManager = msg.deleteManager;
            }
            socket.emit("updateChatRoom", variable);        
        });
        socket.on("inviteChatRoom", (msg, done)=>{
            msg.user.forEach((id)=>{
                //socket invite user
                console.log(`id = ${id}`);
                // socket.join();
                // socket.to(msg.chatid).emit("welcome", id.nickname);
            });
            chatMessage.push({chatid: msg.chatid, list:[]});
            done(true);
        });
        socket.on("exitChatRoom", (msg, done)=>{
            console.log(msg);
            const idx = myChatRoom.order.findIndex((id)=>id === msg.chatid);
            myChatRoom.chatroom.splice(idx, 1);
            myChatRoom.order.splice(idx, 1);
            chatMessage.filter(message => message.chatid !== msg.chatid);

            socket.leave(msg.chatid, ()=>{
                socket.to(msg.chatid).emit("exitChatRoom", socket.nickname);
            });
            console.log(`Exit ${msg.chatid}.`);
            done(true);
        });
        socket.on("kickChatRoom", (msg)=>{
            msg.userid.leave(msg.chatid, ()=>{
                msg.userid.to(msg.chatid).emit("kickChatRoom", socket.nickname);
            });

            const idx = myChatRoom.order.findIndex(msg.chatid);
            myChatRoom.chatroom[idx].members.filter(p => p !== msg.userid);
            myChatRoom.chatroom[idx].manager.filter(p => p !== msg.userid);
        });
        socket.on("chatMessage", (msg)=>{
            socket.to(msg.chatid).emit("chatMessage", msg.chatid, socket.nickname, msg.content);
            const chat = chatMessage.find(message => message.chatid === msg.chatid);
            chat?.list?.push({userid: userInfo.id, content: msg.content});
        });
        socket.on("qrcode", (setCode)=>{
            console.log('qrcode made!');
            // return new Promise(()=>{
                // code = undefined;
                makeCode(setCode);
            // });
            // .then(socket.emit("qrcode", {"qrcode": code}));
        });
        socket.on("verifiedcode", (data, done)=>{
            console.log('verifying code!', data.token);
            verifiedCode(data, done);
        });
        socket.on('myChatRoom', ()=>{
            socket.emit('myChatRoom', myChatRoom);
        });
        socket.on("publicChatRoom", ()=>{
            socket.emit("publicChatRoom", publicChatRoom); 
        });


        //game
        socket.on("randomMatching", (done)=>{
            console.log("randomMatching");
            if (Math.floor(Math.random() * 2)){
                console.log('1!!!!');
                done(false);
            }
        });
        socket.on("randomMatchingCancel", ()=>{
            console.log("random Matching is Canecled!!!");
        });
        socket.on("enterGameRoom", (msg)=>{
            if (Math.floor(Math.random() * 2)){
                socket.emit("enterGameRoom", {
                    title: 'hello1',
	                roomid: '12222',
	                manager: "123223",
	                map:'1',
	                observer: [{userid: "132943", nickname: "oberser1", profile: 3}, {userid: "1292943", nickname: "observer2", profile: 2}],
	                type: 'Public',
	                status: false,
	                players:[{userid: "1232943", nickname: "player1", profile: 1}],
	                isPlayer: true
                });
            }
        })
        socket.on("exitGameRoom", (msg)=>{
            console.log(msg);
            socket.emit("exitGameRoom");
        })
        socket.on("startGame", (msg)=>{
            console.log(msg);
            socket.emit("startGame", {
                roomid: msg.roomid,
                score: 10,
                player1: '1212',
                plater2: '1424'
            });
        })
        socket.on("gameRoomList", ()=>{
            console.log('gameRoomList');
            socket.emit("gameRoomList", [
            	{title: 'hello1', roomid: '12222', map:'1', observer: 2, type: 'Public', password: false, status: false, player:1, maxObserver:3},
            	{title: 'hello2', roomid: '12272', map:'1', observer: 2, type: 'Public', password: false, status: false, player:2, maxObserver:5},
            	{title: 'hello3', roomid: '12262', map:'1', observer: 2, type: 'Public', password: false, status: false, player:2, maxObserver:4},
            	{title: 'hello4', roomid: '1252', map:'1', observer: 3, type: 'Private', password: true, status: false, player:1, maxObserver:5},
            	{title: 'hello5', roomid: '17262', map:'1', observer: 2, type: 'Public', password: false, status: false, player:2, maxObserver:4},
            	{title: 'hello6', roomid: '15752', map:'1', observer: 3, type: 'Private', password: true, status: false, player:1, maxObserver:5},
            	{title: 'hello7', roomid: '12462', map:'1', observer: 2, type: 'Public', password: false, status: false, player:2, maxObserver:4},
        	    {title: 'hello8', roomid: '143352', map:'1', observer: 5, type: 'Private', password: true, status: false, player:1, maxObserver:5}
            ]);
        })

        // socket.on("enter_room", (msg, done)=>{
        //     socket.join(msg);
        //     done();
        //     socket.to(msg).emit("welcome", socket.nickname, countRoom(msg));
        //     io.sockets.emit("room_change", publicRooms());
        // });
        // socket.on("disconnecting", ()=>{
        //     socket.rooms.forEach((room)=>{
        //         socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
        //     });
        // });
        // socket.on("new_message", (msg, room, done)=>{
        //     socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);    
        //     done();
        // });
        // socket.on("nickname", nickname=> socket["nickname"]=nickname);
    });
};