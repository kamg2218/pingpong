import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { NotFoundUserException } from "src/exception/NotFoundUser.exception";
import { Response } from 'express'
import { getRepository } from "typeorm";
import { WaitingSignup } from "src/db/entity/User/WaitingSignup.entity";
import { signupPage } from "src/config/redirect_url";

@Catch(NotFoundUserException)
export class NotFoundUserFillter implements ExceptionFilter {
    async catch(exception : NotFoundUserException, host : ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const repo = getRepository(WaitingSignup);
        const obj = repo.create();
        obj.email = exception.Email;
        await repo.insert(obj)
        const get = await repo.findOne({email : obj.email})
        response.status(status)
                .cookie('_pongTempEmailId', get.emailid, {maxAge : 300000}) // db에서도 지워야 함.
                .redirect(signupPage)
    }
}
