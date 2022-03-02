import { IsString, IsUUID } from "class-validator";

export class GameRoomInfoDTO {
    @IsUUID()
    roomid : string;
}