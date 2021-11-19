import { HttpException, HttpStatus } from "@nestjs/common";

export class NotFoundUserException extends HttpException {
    constructor(private email : string) {
        super('NotFoundUser', HttpStatus.NOT_FOUND);
    }

    get Email() {
        return this.email;
    }
}