import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString } from "class-validator";

export class SignUpDTO {
    @ApiProperty({description:'nickname'})
    @IsString()
    readonly nickname : string;

    @ApiProperty({description:'profile'})
    @IsNumber()
    readonly profile : number;
}