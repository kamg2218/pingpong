import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString, IsDate } from "class-validator";

export class ChatMessageDTO {
    @IsString()
    readonly chatid : string;

    @IsString()
    readonly content : string;

}