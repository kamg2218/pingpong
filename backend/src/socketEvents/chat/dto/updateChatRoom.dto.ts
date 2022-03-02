import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString, IsBoolean, IsOptional, IsArray } from "class-validator";

export class UpdateChatRoomDTO {
    @IsString()
    readonly chatid : string;

    @IsOptional()
    @IsString()
    readonly title? : string;

    @IsOptional()
    @IsString()
    readonly type? : "private" | "public";

    @IsOptional()
    @IsBoolean()
    readonly lock? : boolean;

    @IsOptional()
    @IsString()
    readonly password? : string;

    @IsOptional()
    @IsArray()
    @IsString({each : true})
    readonly addManager? : string[];

    @IsOptional()
    @IsArray()
    @IsString({each : true})
    readonly deleteManager? : string[];
}