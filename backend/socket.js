const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const {makeCode, verifiedCode} = require('./qrcode');

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
            socket.emit("userInfo", {
                id: "123223",
                nickname: "first_user",
                win: 3,
                lose: 2,
                profile: 1,
                level: "",
                levelpoint: 0,
                levelnextpoint: 100,
                friends: [{userid:'121', nickname: 'first', profile: 1, onoff: true}, {userid:'122', nickname: 'second', profile: 2, onoff: false}, {userid:'112', nickname: 'third', profile: 0, onoff: false},{userid:'111', nickname: 'forth', profile: 3, onoff: false},{userid:'101', nickname: 'fifth', profile: 4, onoff: false}, {userid:'2232', nickname: 'se3th', profile: 4, onoff: false}, {userid:'4253', nickname: 'fisdkesh', profile: 1, onoff: false}],
                // newfriends: [{userid:'1211111', nickname: 'newbie', profile: 2, onoff: false}],
                blacklist: [],
                qrcode: ''
            });
        });
        //Friends
        socket.on("newFriend", (msg, done)=>{
            console.log(msg.result);
            if (msg.result === true){
                //a
                socket.emit("addFriend", {
                    "userid": msg.userid,
                    "nickname": "NewFriend",
                    "profile": 4,
                    "onoff": false,
                });
                done();
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
        });
        socket.on("blockFriend", (msg)=>{
            socket.emit("deleteFriend", {"userid": msg.userid});
            socket.emit("blockFriend", {
                "userid": msg.userid,
                "nickname": "blocked",
                "profile": 2,
            });
        });
        socket.on("unblockFriend", (msg)=>{
            console.log("Unblocked!");
        });
        
        //Chat
        socket.on("myChatRoom", ()=>{
            socket.emit("myChatRoom", {});
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
        socket.on("updateChatRoom", (msg)=>{
            let variable = {};

            variable.chatid = msg.chatid;
            if (msg.title)
                variable.title = msg.title;
            if (msg.type)
                variable.type = msg.type;
            if (msg.lock)
                variable.lock = msg.lock;
            if (msg.password)
                variable.password = msg.password;
            if (msg.addManager)
                variable.addManager = msg.addManager;
            if (msg.deleteManager)
                variable.deleteManager = msg.deleteManager;
            socket.emit("updateChatRoom", variable);
        });
        socket.on("inviteChatRoom", (msg, done)=>{
            msg.user.forEach((id)=>{
                //socket invite user
                console.log(`id = ${id}`);
                // socket.join();
                // socket.to(msg.chatid).emit("welcome", id.nickname);
            });
            done(true);
        });
        socket.on("exitChatRoom", (msg, done)=>{
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
        });
        socket.on("chatMessage", (msg)=>{
            socket.to(msg.chatid).emit("chatMessage", msg.chatid, socket.nickname, msg.content);
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
            socket.emit('myChatRoom', [
                {idx:1, chatid:'1232', title:'', member:['a', 'b'], owner:'hello', lock: true},
                {idx:2, chatid:'1212', title:'topic', member:['ac', 'bc', 'cd', 'ede'], owner:'u', lock:false},
            ]);
        });
        socket.on("publicChatRoom", ()=>{
            socket.emit("publicChatRoom", {
               order: ['1222', '18473', '18474', '18475', '18476'],
               chatroom: [
                    {title: 'first_room', chatid:'1222', owner:'183472', manager:['183472'], members:[{userid: '183472', nickname: 'hihihi', profile: 5}], lock: false, type: 'public', max:10},
                    {title: 'second_room', chatid:'18473', owner:'1899472', manager:['1899472'], members:[{userid: '1899472', nickname: 'hhelllo', profile: 3}], lock: true, type: 'public', max:100},
                    {title: 'second_room', chatid:'18474', owner:'1899472', manager:['1899472'], members:[{userid: '1899472', nickname: 'hhelllo', profile: 3}], lock: true, type: 'public', max:100},
                    {title: 'second_room', chatid:'18475', owner:'1899472', manager:['1899472'], members:[{userid: '1899472', nickname: 'hhelllo', profile: 3}], lock: true, type: 'public', max:100},
                    {title: 'second_room', chatid:'18476', owner:'1899472', manager:['1899472'], members:[{userid: '1899472', nickname: 'hhelllo', profile: 3}], lock: true, type: 'public', max:100}
                ]
            });
        });

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