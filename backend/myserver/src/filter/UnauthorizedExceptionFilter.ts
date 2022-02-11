import { Logger } from '@nestjs/common';
import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { fronLoginPage } from 'src/config/redirect_url';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger : Logger) {

    }
    
    async catch(exception: UnauthorizedException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        this.logger.error(`[Error] error code : ${status} - UnauthorizedException`)
        response.status(status)
                .send(exception.message)
                // .json({data : exception.message})
                // .redirect("http://localhost:3000")
                // .redirect(fronLoginPage);
        return response;
    }
}