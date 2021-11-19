import { IsEmail, IsString } from "class-validator";

export class SignUpDTO {
    @IsString()
    readonly nickname : string;

    @IsString()
    readonly profile : string;
}