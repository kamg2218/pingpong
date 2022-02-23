import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString } from "class-validator";

export class CreateGameRoomDTO {
    @ApiProperty({description:'title'})
    @IsString()
    readonly title : string;

    @ApiProperty({description:'speed'})
    @IsString()
    readonly speed : string;

    @ApiProperty({description : 'observer'})
    @IsNumber()
    readonly  observer : number;

    @ApiProperty({description : "type"})
    @IsString()
    readonly type : "private" | "public";

    @ApiProperty({description : " password"})
    @IsString()
    readonly password? : string
}