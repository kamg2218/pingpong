import { Socket } from "socket.io";

export class IoSocket extends Socket {
    private _nickname : string;

    get nickname() {
        return (this._nickname)
    }

    set nickname(value : string) {
        if (value.length)
            this._nickname = value;
    }
}