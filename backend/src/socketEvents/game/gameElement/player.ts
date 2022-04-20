import { canvas } from "./canvas";
import { DIRECTION } from "./direction";
import { Pos } from "./pos";

// const speedPercent : Array<number> = [4,5,6,7];
export class Player extends Pos {
    private userid : string;
    private _score : number;
    private _ready : boolean;
    private _onoff : boolean;

    constructor(userid : string, side : "right" | "left") {
        super({
            x : side === 'left' ? canvas.widthPercent(4) : canvas.width - canvas.widthPercent(8),
            y : (canvas.height / 2) - canvas.heightPercent(20),
            dirX : DIRECTION.IDLE,
            dirY : DIRECTION.IDLE, 
            width : canvas.widthPercent(2),
            height : canvas.heightPercent(15),
            speed :  0});
        this.id = userid;
        this._onoff = false;
        this.score = 0;
        this.ready = true;
    }

    public reset(side : string, speedTimes : number) {
        this.x = side === 'left' ? canvas.widthPercent(4) : canvas.width - canvas.widthPercent(8);
        this.y = (canvas.height / 2) - canvas.heightPercent(20);
        this.dirX = DIRECTION.IDLE;
        this.dirY = DIRECTION.IDLE;
        this.speed = 0;
        this.speedUp(speedTimes);
        // this.width = canvas.widthPercent(4);
        // this.height = canvas.heightPercent(20);
        // this.speed = (canvas.heightPercent(2));
        this.score = 0;
    }

    get ready() {
        return this._ready;
    }

    set ready(value : boolean) {
        this._ready = value;
    }
    
    get id() {
        return this.userid;
    }

    set id(value : string) {
        if (value)
            this.on();
        this.userid = value;
    }

    get score() {
        return this._score;
    }
    
    set score(value : number) {
        this._score = value;
    }

    get direction() {
        return this.dirY;
    }

    set direction(value : number) {
        this.dirY = value;
    }

    public on() {
        this._onoff = true;
    }

    public off() {
        this._onoff = false;
    }

    get onoff(){
        return this._onoff;
    }

    public speedUp(times : number) {
        this.speed = canvas.heightPercent(1.3 + 0.1 * times);
    }

    public move({x, y, radius}) {
        if (this.direction === DIRECTION.UP)
            this.y -= this.speed;
        else if (this.direction === DIRECTION.DOWN)
            this.y += this.speed;
        if (x >= this.x && x <= this.x + this.width) {
            if (this.y < y + radius && y < this.y + this.height)
                this.y = y + radius;
            else if (y > this.y && this.y + this.height > canvas.height - 2 * radius)
                this.y = canvas.height - 2 * radius - this.height ;
        }


        // if (this.direction === DIRECTION.UP)
        //     this.y -= this.speed;
        // else if (this.direction === DIRECTION.DOWN)
        //     this.y += this.speed;
        // if (x >= this.x && x <= this.x + this.width) {
        //     if (this.y < y + radius && y < this.y + this.height)
        //         this.y = y + radius;
        //     else if (y > this.y && this.y + this.height > canvas.height - 2 * radius)
        //         this.y = canvas.height - 2 * radius - this.height ;
        // }
            
        
        // if (this.y < 0)
        //     this.y = 0;
        // else if (this.y >= canvas.height - this.height)
        //     this.y = canvas.height - this.height;
    }
}