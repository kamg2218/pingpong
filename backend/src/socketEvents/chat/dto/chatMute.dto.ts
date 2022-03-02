import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString } from "class-validator";

export class ChatMuteDTO {
    @IsString()
    readonly chatid : string;

    @IsNumber()
    readonly time : number;

    @IsString()
    readonly userid : string;
}