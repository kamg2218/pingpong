import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString } from "class-validator";

export class ChatHistoryDTO {
    @IsString()
    readonly chatid : string;

}