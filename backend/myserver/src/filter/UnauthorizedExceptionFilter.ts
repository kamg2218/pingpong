import { ExceptionFilter, Catch, HttpException, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { loginPage } from 'src/config/redirect_url';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();

        response
            .status(status).redirect(loginPage);
    }
}