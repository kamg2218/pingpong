import { canvas } from "./canvas";
import { DIRECTION } from "./direction";

export class Pos {
    private _x : number;
    private _y : number;
    private _dirX : number;
    private _dirY : number;
    private _speed : number;
    private _width : number;
    private _height : number;

    constructor(
        {x, y, dirX, dirY, width, height, speed} 
            : {x : number, y : number, dirX : number, dirY : number, width : number, height : number, speed : number}) {
        this._x = x;
        this._y = y;
        this._dirX = dirX;
        this._dirY = dirY;
        this._width = width;
        this._height = height;
        this._speed = speed;
    }
    
    set width(value : number) {
        this._width = value;
    }

    get width() {
        return this._width;
    }

    set height(value : number) {
        this._height = value;
    }

    get height() {
        return this._height;
    }

    set x(value : number) {
        this._x = value;
        if (value < 0)
            this._x = 0;
        if (value + this.width > canvas.width)
            this._x = canvas.width - this.width;
    }

    get x() {
        return this._x;
    }

    set y(value : number) {
        this._y = value;
        if (value < 0)
            this._y = 0;
        if (value + this.height > canvas.height)
            this._y = canvas.height - this.height;
    }

    get y() {
        return this._y;
    }

    set dirX(value : number) {
        this._dirX = value;
    }

    get dirX() { 
        return this._dirX;
    }

    set dirY(value : number) {
        this._dirY = value;
    }

    get dirY() {
        return this._dirY;
    }

    set speed(value : number) {
        this._speed = value;
    }
    
    get speed() {
        return this._speed;
    }

    public switchDirX() {
        if (this.dirX === DIRECTION.RIGHT)
            this.dirX = DIRECTION.LEFT;
        else if (this.dirX === DIRECTION.LEFT)
            this.dirX = DIRECTION.RIGHT;
    }

    public switchDirY() {
        if (this.dirY === DIRECTION.UP)
            this.dirY = DIRECTION.DOWN;
        else if (this.dirY === DIRECTION.DOWN)
            this.dirY = DIRECTION.UP;
    }

    public print() {
        let dirX, dirY;
        if (this.dirX === DIRECTION.RIGHT)
            dirX = "=>";
        else if (this.dirX === DIRECTION.LEFT)
            dirX = "<=";
        else if (this.dirX === DIRECTION.IDLE)
            dirX = "."
        else
            dirX = "error " + this.dirX;
        if (this.dirY === DIRECTION.UP)
            dirY = "^";
        else if (this.dirY === DIRECTION.DOWN)
            dirY = "v";
        else if (this.dirY === DIRECTION.IDLE)
            dirY = "."
        else
            dirY = "error"

        console.log(`dirX : ${dirX}, dirY : ${dirY}, x : ${this.x}, y : ${this.y} `)
    }
}
