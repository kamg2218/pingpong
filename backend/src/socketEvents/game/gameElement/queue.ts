export class Queue {
    private _arr;

    constructor() {
        this._arr = []
    }

    public push(item : any) {
        this._arr.push(item);
    }

    public pop() {
        return this._arr.shift();
    }

    public size() {
        return this._arr.length;
    }

    public delete(value) {
        var index = this._arr.indexOf(value);
        if (index !== -1) {
            this._arr.splice(index, 1);
        };
    }
}