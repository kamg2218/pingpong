import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString } from "class-validator";

export class ChatHistoryUpdateDTO {
    @IsString()
    readonly chatid : string;

}