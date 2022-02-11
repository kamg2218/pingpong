import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import {Observable} from 'rxjs'

function validateRequest(request : any) :boolean {
    return true;
}

@Injectable()
export class WSAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) : boolean | Promise<boolean> | Observable<boolean> {
    console.log("IN WSAuthGuard ")
    const user = context.switchToHttp().getRequest();
    console.log("auth : ", user.handshake.auth);
    // const email = user.handshake.auth.email;
    // const password = user.handshake.auth.password;
    return false;
  }
}
