import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString } from "class-validator";

export class ExitChatRoomDTO {
    @IsString()
    readonly chatid : string;
}