import { IsString } from "class-validator";

export class InviteGameRoomDTO {
    @IsString()
    userid : string;
    
    @IsString()
    roomid : string;
}