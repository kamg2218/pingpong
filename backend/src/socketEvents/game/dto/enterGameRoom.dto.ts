import { IsBoolean, IsOptional, IsString } from "class-validator";
import { GameRoomInfoDTO } from "./gameRoomInfo.dto";

export class EnterGameRoomDTO extends GameRoomInfoDTO {
    @IsOptional()
    @IsString()
    password? : string;

    @IsString()
    isPlayer : boolean;
}