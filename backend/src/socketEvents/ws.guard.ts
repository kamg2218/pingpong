import { CanActivate, Injectable } from "@nestjs/common";

@Injectable()
export class WsGuard implements CanActivate {

  constructor() {
  }

  canActivate(context: any) : boolean{
    if (context.args[0].userid)
      return true;
    return false;
  }
}
