import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class InviteChatRoomDTO {
    @IsString()
    readonly chatid : string;

    @IsArray()
    @IsString({each : true})
    readonly user : string[];
}