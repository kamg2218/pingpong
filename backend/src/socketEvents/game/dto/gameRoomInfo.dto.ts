import { IsString, IsUUID } from "class-validator";

export class GameRoomInfoDTO {
    @IsString()
    roomid : string;
}