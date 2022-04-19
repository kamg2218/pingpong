import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class EnterChatRoomDTO {
    @IsString()
    readonly chatid : string;

    @IsOptional()
    @IsString()
    readonly password? : string;
}