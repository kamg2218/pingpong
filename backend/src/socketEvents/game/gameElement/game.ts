import { WsException } from "@nestjs/websockets";
import { Server } from "socket.io";
import { User } from "src/db/entity/User/UserEntity";
import { UserRepository } from "src/db/repository/User/UserCustomRepository";
import { getCustomRepository } from "typeorm";
import { onlineManager } from "../../online/onlineManager";
import { Ball } from "./ball";
import { canvas } from "./canvas";
import { DIRECTION } from "./direction";
import { Player } from "./player";

export class Game {
    private readonly roomid : string;
    private right : Player;
    private left : Player;
    private participants : string[];
    private ball : Ball;
    private turn : string;
    private _running : boolean;
    private _score : number;
    private _winner : string;
    private _loser : string;
    private _over : boolean;
    private _startTime : Date;
    private _endTime : Date;
    private _speed : number;
    private _intervalId;
    private _proxy;

    private static server : Server;

    static init(server : Server) {
        if (!Game.server)
            Game.server = server;
    }

    constructor(gameid : string, speed : number = 1) {
        this.roomid = gameid;
        this.running = false;
        this.over = false;
        this.ball = new Ball(speed);
        this._score = 10;
        this.turn = null;
        this._speed = speed;
        this.participants = [];
        this.left = new Player(null, "left");
        this.right = new Player(null, "right");
    }
    

    get running() {
        return this._running;
    }
    set running(value : boolean) {
        this._running = value;
    }
    set proxy(value) {
        this._proxy = value;
    }

    get proxy() {
        return this._proxy;
    }
    set speed(value : number) {
        if (value >= 1 && value <= 3)
            this._speed = value;
    }

    get speed() {
        return this._speed;
    }

    get over() {
        return this._over;
    }

    set over(value : boolean) {
        this._over = value;
    }

    get rightPlayer() {
        return this.right;
    }

    get leftPlayer() {
        return this.left;
    }

    set startTime(value : Date) {
        this._startTime = value;
    }

    set endTime(value : Date) {
        this._endTime = value;
    }
    get startTime() {
        return this._startTime;
    }
    get endTime() {
        return this._endTime;
    }

    set winner(value : string) {
        this._winner = value;
    }

    get winner() {
        return this._winner
    }

    set loser(value : string) {
        this._loser = value;
    }
    get loser() {
        return this._loser;
    }

    get score() {
        return this._score;
    }

    set score(value : number) {
        this._score = value;
    }

    get id() {
        return this.roomid;
    }

    get name() {
        return  "Game#" + this.roomid;
    }

    public onlineRoom(socketid : string, userid : string) {
        this.participants.push(socketid);
    }

    public offlineRoom(socketid : string) {
        let index = this.participants.indexOf(socketid);
        if (index !== -1) {
            this.participants.splice(index, 1);
        }
    }
    public joinAsPlayer(socketid : string, user : User) {
        const repo_user = getCustomRepository(UserRepository);
        if (!this.left.onoff()) {
            this.left.id = user.userid;
            this.left.on();
            this.left.ready = true;
        }
        else if (!this.right.onoff()) {
            this.right.id = user.userid;
            this.right.on();
            this.right.ready = true;
        }
        else
            throw new Error("The room is already full");
        this.participants.push(socketid);
        this.changeGameRoom(socketid, {
            addPlayer : {...repo_user.getSimpleInfo(user)},
        });
    }

    public joinAsObserver(socketid : string, user : User) {
        const repo_user = getCustomRepository(UserRepository);
        this.participants.push(socketid);
        this.changeGameRoom(socketid, {
            addObserver : {...repo_user.getSimpleInfo(user)},
        });
    }

    private removeFromParticipants(socketid : string) {
        let index = this.participants.findIndex(id=>id===socketid);
        this.participants.splice(index, 1);
    }

    public leave(socketid : string, user : User) {
        const userid = user.userid;
        const repo_user = getCustomRepository(UserRepository);
        let isPlayer = true;
        if (this.right.onoff() && this.right.id === userid) {
            this.right.direction = DIRECTION.IDLE;
            this.right.off();
        }
        else if (this.left.onoff() && this.left.id === userid) {
            this.left.direction = DIRECTION.IDLE;
            this.left.off();
        }
        else
            isPlayer = false;
        this.removeFromParticipants(socketid);
        let updateInfo;
        if (!isPlayer)
            updateInfo = {deleteObserver : repo_user.getSimpleInfo(user)};
        else
            updateInfo = {deletePlayer : repo_user.getSimpleInfo(user)};
        this.changeGameRoom(socketid, updateInfo);
        if (isPlayer && this.running)
            this.forceGameOver();
    }
    
    public changeGameRoom(socketid : string , updateInfo : any) {
        const roomInfo = {
            roomid : this.roomid,
            ...updateInfo,
        }
        if (socketid)
            this.announceExceptMe(socketid, "changeGameRoom", roomInfo);
        else
            this.announce("changeGameRoom", roomInfo);
    }

    public announceExceptMe(mySocketid : string, event : string, data : any) {
        this.participants.map(socketid=>{
            if (socketid != mySocketid)
                Game.server.to(socketid).emit(event, data);
        });     
    };

    public announce(event : string, data : any) {
        this.participants.map(socketid=>{
             Game.server.to(socketid).emit(event, data);
        })
    };

    public makeObserversLeave() {
        const except = [onlineManager.socketIdOf(this.rightPlayer.id), onlineManager.socketIdOf(this.leftPlayer.id)];
        
        this.participants.map(async socketid=>{
            if (except.findIndex(elem=>elem===socketid) === -1) {
                const repo_user = getCustomRepository(UserRepository);
                const userid = onlineManager.userIdOf(socketid);
                const user = await repo_user.findOne(userid);
                this.removeFromParticipants(socketid);
                let updateInfo = {deleteObserver : repo_user.getSimpleInfo(user)};
                this.changeGameRoom(socketid, updateInfo);
                Game.server.to(socketid).emit("exitGameRoom", {roomid : this.id});
            }     
        });
    };
    
    get drawBall() {
        return {
            color : "white",
            x : this.ball.x,
            y : this.ball.y,
            r : this.ball.radius,
        };
    };

    get drawRight() {
        return {
            color : "red",
            x : this.right.x,
            y : this.right.y,
            width : this.right.width,
            height : this.right.height,
        }
    };

    get drawLeft() {
        return {
            color : "yellow",
            x : this.left.x,
            y : this.left.y,
            width : this.left.width,
            height : this.left.height,
        }
    };

    get drawCanvas() {
        return {
            color : "green",
            width : canvas.width,
            height : canvas.height,
        }
    };

    /* 게임진행 */
    public checkIfItCanStart() {
        if (!this.right.onoff() || !this.left.onoff()) {
            console.log("not enough player");
            return true;
        }
        if (!this.right.ready || !this.left.ready) {
            console.log("players are ready")
            return false;
        }
        if (this.running) {
            console.log("game is running")
            return false;
        }
        return true;
    }
    
    private resetGame() {
        this.over = false;
        this.running = false;
        this.winner = null;
        this.loser = null;
        this.ball.reset(this.speed);
    }

    public async getInitialInfo() {
        const repo_user = getCustomRepository(UserRepository);
        const left = await repo_user.findOne(this.left.id);
        const right = await repo_user.findOne(this.right.id);
        return {
            roomid : this.roomid,
            score : this.score,
            left : repo_user.getSimpleInfo(left),
            right : repo_user.getSimpleInfo(right),
        };
    }
    
    public async start() {
        this.resetGame();
        await this.sendInitialInfo();
        this.running = true;
        this.startTime = new Date();
        await this.readyCount();
        this.run();
    }

    private async readyCount() {
        console.log("Counting start");
        // await this.counting(3);
        // await this.counting(2);
        await this.counting(1);
    }

    private async sendInitialInfo() {
        const initialInfo = await this.getInitialInfo();
        this.announce("startGame", initialInfo);
    }

    private counting(count : number) {
        return new Promise((resolve)=>{
            console.log("Timer : ", count);
            this.announce("ready", {count : count});
            setTimeout(resolve, 1000)});
    }

    private run() {
        const code = setInterval(async ()=>{   
            if (this.over) {
                this.proxy.over = true;
                clearInterval(this._intervalId);
                return await this.clearGame();
            }
            this.loop();
            if (!this.over)
                this.announce("draw", {
                    background : this.drawCanvas,
                    ball : this.drawBall,
                    right : this.drawRight,
                    left : this.drawLeft,
                });
            }, 50);
        this._intervalId = code;
    }

    private loop() {
        if (!this.over) {
            this.checkPositionOfBall(); // 공이 판에서 벗어났는지 확인. 상하로 벗어나면 방향 변경. 좌우로 벗어나면 승패처리.
            this.moveBothPlayers(); // 키 입력 있을 때만.
            if (this.turn)
                this.newServe();
            this.ball.move();
            this.checkCollideBtwBallAndPlayer();
        }
        this.checkGameOver();
    }

    private checkCollideBtwBallAndPlayer() {
        let arr = [ "left", "right"];
        for (let index in arr) {
            let side = arr[index];
            let quadrant = this.quadrant(this[side]);
            let d = this.distance(quadrant, side);
            if (!d || d <= this.ball.radius) {
                while (!d || d <= this.ball.radius) {
                    this.ball.moveReverse();
                    quadrant = this.quadrant(this[side]);
                    d = this.distance(quadrant, side);
                    if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= canvas.height)
                        break;
                }
                if (quadrant !== 2 && quadrant !== 7)
                    this.ball.switchDirY();
                if (quadrant !== 4 && quadrant !== 5)
                    this.ball.switchDirX();
                this.ball.move();
            }
        }
    }

    public pause() {
        if (this.over || !this.running) {
            console.log("The game is over")
            throw new WsException("The game is over")
        }
        this.running = false;
        clearInterval(this._intervalId);
        return true;
    }

    public restart() {
        if (this.over) {
            console.log("The game is over")
            throw new WsException("The game is over")
        }
        if (this.running)
            return false;
        this.running = true;
        this.run();
        return true;
    }

    private quadrant({x, y, width, height}) {
        if (this.ball.x <= x) {
            if (this.ball.y <= y)
                return 1;
            else if (this.ball.y < y + height)
                return 2;
            else
                return 3;
        }
        else if (this.ball.x < x + width) {
            if (this.ball.y <= y)
                return 4;
            else if (this.ball.y >= y + height)
                return 5;
        }
        else {
            if (this.ball.y <= y)
                return 6;
            else if (this.ball.y < y + height)
                return 7;
            else
                return 8;
        }
        return 9;
    }

    // 1 |_4_| 6
    // 2 | 9 | 7
    // 3 |-5-| 8
    private distance(quadrant : number, side : string) {
        const player = this[side];
        if (quadrant === 1)
            return Math.sqrt(Math.pow(player.x - this.ball.x, 2) + Math.pow(player.y - this.ball.y, 2));
        else if (quadrant === 2)
            return player.x - this.ball.x;
        else if (quadrant === 3)
            return Math.sqrt(Math.pow(player.x - this.ball.x, 2) + Math.pow(this.ball.y - (player.y + player.height),2));
        else if (quadrant === 4)
            return player.y - this.ball.y;
        else if (quadrant === 5)
            return this.ball.y - (player.y + player.height);
        else if (quadrant === 6)
            return Math.sqrt(Math.pow(this.ball.x - (player.x + player.width), 2) + Math.pow(player.y - this.ball.y, 2));
        else if (quadrant === 7)
            return this.ball.x - (player.x + player.width);
        else if (quadrant === 8)
            return Math.sqrt(Math.pow(this.ball.x - (player.x + player.width), 2) + Math.pow(this.ball.y - (player.y + player.height), 2));
    }

    private checkPositionOfBall(){
        const result = this.ball.doesNeedToResetTurn();
        if (result.x) {
            this.resetTurn(result.winner, result.loser);
            this.announce("score", {
                left : this.left.score,
                right : this.right.score,
            });
        }
    }

    public chagnePlayersDirection(userid : string, direction : string) {
        const code = {"up" : DIRECTION.UP, "down" : DIRECTION.DOWN, "idle" : DIRECTION.IDLE}
        
        if (this.over || !this.running) {
            console.log("The game is not running")
            throw new WsException("The game is not running")
        }
        let codeDir = code[direction];
        if (codeDir === undefined)
            throw new WsException("wrong direction");
        if (this.right.id === userid)
            this.right.direction = codeDir;
        else if (this.left.id === userid)
            this.left.direction = codeDir;
    }

    private moveBothPlayers() {
        this.right.move(this.ball);
        this.left.move(this.ball);
    }

    private resetTurn(winner : string, loser : string) {
        // delete this.ball;
        // this.ball = new Ball(this.speed);
        this.ball.reset(this.speed);
        this.turn = loser;
        this[winner].score++;
    }

    private newServe() {
        this.ball.dirX = this.turn === "left" ? DIRECTION.LEFT : DIRECTION.RIGHT;
        this.ball.dirY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
        this.ball.y = Math.floor(Math.random() * canvas.height - 200) + 200;
        this.turn = null;

        //temp
        // this.ball.x = this.leftPlayer.x + this.leftPlayer.width / 2;
        // this.ball.y = 0;
        // this.ball.dirX = DIRECTION.IDLE;
        // this.ball.dirY = DIRECTION.DOWN;
    }

    private forceGameOver() {
        console.log("Force game over")
        if (!this.right.onoff()) {
            this.winner = this.left.id;
            this.loser = this.right.id;
        }
        else if (!this.left.onoff()) {
            this.winner = this.right.id;
            this.loser = this.left.id;
        }
        else
            return false;
        this.over = true;
        this.running = false;
        this.endTime = new Date();
        return true;
    }

    private checkGameOver() {
        if (this.over)
            return ;
        if (this.right.score === this.score) {
            this.winner = this.right.id;
            this.loser = this.left.id;
        }
        else if (this.left.score === this.score) {
            this.winner = this.left.id;
            this.loser = this.right.id;
        }
        else
            return ;
        this.over = true;
        this.running = false;
        this.endTime = new Date();
    }

    private async clearGame() {
        this.announce("draw", {
            background : this.drawCanvas,
            ball : this.drawBall,
            right : this.drawRight,
            left : this.drawLeft,
        });
        const winnerUserInfo =  await getCustomRepository(UserRepository).findOne(this.winner); //check 수정필요
        this.announce("gameResult", {winner : winnerUserInfo.userid});
        this.right.ready = false;
        this.left.ready = false;
    }

    public ballSpeed(type : string) {
        if (type === "up")
            this.ball.speedUp();
        else if (type === "down")
            this.ball.speedDown();
    }
}