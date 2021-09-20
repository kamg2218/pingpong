export class Exception extends Error {
    constructor(readonly body : {statusCode : number, message : string}){
        super();
    }
}