import { IsEmail, IsString } from "class-validator";

export class CreateUserDTO {
    @IsEmail()
    readonly email : string;

    @IsString()
    readonly nickname : string;

    @IsString()
    readonly password : string;
}