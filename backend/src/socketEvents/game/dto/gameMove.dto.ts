import { IsString } from "class-validator";
import { GameRoomInfoDTO } from "./gameRoomInfo.dto";

export class GameMoveDTO extends GameRoomInfoDTO {
    @IsString()
    direction : string;
}