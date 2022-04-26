import {CanActivate, Injectable} from '@nestjs/common';
import { onlineManager } from '../online/onlineManager';


@Injectable()
export class WsGuard implements CanActivate {
	constructor() {}

	canActivate(context: any) : boolean {
		if (context.args[0].userid && onlineManager.isOnline(context.args[0].userid))
			return true;
		console.log("socket event rejected");
		return false;
	}
}
