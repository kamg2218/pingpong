import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString } from "class-validator";

export class KickChatRoomDTO {
    @IsString()
    readonly chatid : string;

    @IsString()
    readonly userid : string;
}