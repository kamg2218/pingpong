import { IsNumber, IsOptional, IsString } from "class-validator";
import { GameRoomInfoDTO } from "./gameRoomInfo.dto";

export class ChangeGameRoomDTO extends GameRoomInfoDTO{
    @IsOptional()
    @IsString()
    title? : string;

    @IsOptional()
    @IsNumber()
    password? : number;

    @IsOptional()
    @IsNumber()
    speed? : number;

    @IsOptional()
    @IsString()
    type? : string;
}