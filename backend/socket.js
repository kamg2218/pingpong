const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const {makeCode, verifiedCode} = require('./qrcode');

module.exports = function(io){
    console.log("socket starts!");
    
    // const io = new Server(server, {
    //     cors: {
    //         origin: ["https://admin.socket.io"],
    //         credentials: true,
    //     },
    // });
    // instrument(io, {
    //     auth: false,
    // });

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
                "nickname": socket.nickname,
                "win": 3,
                "lose": 1,
                "profile": socket.profile,
            });
        });
        //Friends
        socket.on("newFriend", (msg)=>{
            if (msg.result === true){
                //a
                socket.emit("newFriend", {
                    "userid": msg.userid,
                    "nickname": "NewFriend",
                    "profile": 4,
                    "onoff": false,
                });
                //b
                socket.to(msg.userid).emit("newFriend", {
                    "userid": socket,
                    "nickname": socket.nickname,
                    "profile": socket.profile,
                    "onoff": socket.onoff,
                });
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
        socket.on("createChatRoom", (msg)=>{
            socket.join(msg.title);
            socket.to(msg.title).emit("welcome", socket.nickname);
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
        socket.on("inviteChatRoom", (msg)=>{
            msg.user.forEach((id)=>{
                //socket invite user
                id.join(msg.chatid);
                id.to(msg.chatid).emit("welcome", id.nickname);
            });
        });
        socket.on("exitChatRoom", (msg)=>{
            socket.leave(msg.chatid, ()=>{
                socket.to(msg.chatid).emit("exitChatRoom", socket.nickname);
            });
            console.log(`Exit ${msg.chatid}.`);
        });
        socket.on("kickChatRoom", (msg)=>{
            msg.userid.leave(msg.chatid, ()=>{
                msg.userid.to(msg.chatid).emit("kickChatRoom", socket.nickname);
            });
        });
        socket.on("chatMessage", (msg)=>{
            socket.to(msg.chatid).emit("chatMessage", msg.chatid, socket.nickname, msg.content);
        });

        // let code;
        // async function setData(data){
        //     console.log('setData is setting..');
        //     code = data;
        // }
        // function doData(){
        //     // console.log(`data = ${code}`);
        //     socket.emit("qrcode", {"qrcode": code});
        // }
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