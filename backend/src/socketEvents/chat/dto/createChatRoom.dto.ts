import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateChatRoomDTO {
    @IsString()
    readonly title? : string;

    @IsString()
    readonly type : "private" | "public";

    @IsOptional()
    @IsString()
    readonly password? : string;

    @IsOptional()
    @IsArray()
    @IsString({each : true})
    readonly member? : string[];
}