import { canvas } from "./canvas";
import { DIRECTION } from "./direction";
import { Pos } from "./pos";

export class Ball extends Pos {
    constructor(speed : number) {
        const r =  (canvas.heightPercent(1));
        super(
            {x : (canvas.width/2),
            y : (canvas.height/2),
            dirX : DIRECTION.IDLE,
            dirY : DIRECTION.IDLE,
            width : r,
            height : r,
            speed : (canvas.heightPercent(0.5))});
        if (speed === 2)
            this.speed = canvas.heightPercent(0.7);
        else if (speed === 3)
            this.speed = canvas.heightPercent(0.9);
    }

    set radius(value : number) {
        this.width = this.height = value;
    }

    get radius() {
        return this.width;
    }

    public speedUp() {
        this.speed += (canvas.heightPercent(0.1));
    }

    public speedDown() {
        this.speed -= (canvas.heightPercent(0.1));
        if (this.speed < 0)
            this.speed = 0;
        // if (this.speed < canvas.heightPercent(0.5))
            // this.speed = canvas.heightPercent(0.5);
    }

    public doesNeedToResetTurn() {
        let res = {x : false, winner : "", loser : ""}
        if (this.x - this.radius <= 0)
            this.dirX = DIRECTION.RIGHT;
        else if (this.x >= canvas.width/4 - this.radius)
            this.dirX = DIRECTION.LEFT;
        if (this.y - this.radius <= 0)
            this.dirY = DIRECTION.DOWN;
        else if (this.y >= canvas.height/2 - this.radius)
            this.dirY = DIRECTION.UP
        return res;

        // let res = {x : false, winner : "", loser : ""}
        // if (this.x - this.radius <= 0)
        //     res = Object.assign(res, {x : true, winner : "right", loser : "left"}); //this.dirX = DIRECTION.RIGHT;          
        // else if (this.x >= canvas.width - this.radius)
        //     res = Object.assign(res, {x : true, winner : "left", loser : "right"}); //this.dirX = DIRECTION.LEFT;
        // if (this.y - this.radius <= 0)
        //     this.dirY = DIRECTION.DOWN;
        // else if (this.y >= canvas.height - this.radius)
        //     this.dirY = DIRECTION.UP
        // return res;

        // if (this.x <= 0)
        //     res = Object.assign(res, {x : true, winner : "right", loser : "left"}); //this.dirX = DIRECTION.RIGHT;          
        // else if (this.x >= canvas.width - this.radius)
        //     res = Object.assign(res, {x : true, winner : "left", loser : "right"}); //this.dirX = DIRECTION.LEFT;
        // if (this.y <= 0)
        //     this.dirY = DIRECTION.DOWN;
        // else if (this.y >= canvas.height - this.radius)
        //     this.dirY = DIRECTION.UP
        // return res;
    }
   
    public move() {
        if (this.dirY === DIRECTION.UP)
            this.y -= this.speed / 1.5;
        else if (this.dirY === DIRECTION.DOWN)
            this.y += this.speed / 1.5;
        if (this.dirX === DIRECTION.LEFT)
            this.x -= this.speed;
        else if (this.dirX === DIRECTION.RIGHT)
            this.x += this.speed;
    }

    public moveReverse() {
        if (this.dirY === DIRECTION.UP)
            this.y += this.speed / 1.5;
        else if (this.dirY === DIRECTION.DOWN)
            this.y -= this.speed / 1.5;
        if (this.dirX === DIRECTION.LEFT)
            this.x += this.speed;
        else if (this.dirX === DIRECTION.RIGHT)
            this.x -= this.speed;
    }

    public adjustment({x, y, width, height}) {
        console.log(`x : ${x}, y : ${y}, w : ${width}, h : ${height}`);
    }

    public reset(speed : number) {
        const r =  (canvas.heightPercent(1));
        this.x = (canvas.width/2);
        this.y = (canvas.height/2);
        this.dirX = [DIRECTION.LEFT, DIRECTION.RIGHT][Math.round(Math.random())];
        this.dirY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
        this.width = r;
        this.height = r;
        this.speed = (canvas.heightPercent(0.5));
        if (speed === 2)
            this.speed = canvas.heightPercent(0.7);
        else if (speed === 3)
            this.speed = canvas.heightPercent(0.9);
    }


}