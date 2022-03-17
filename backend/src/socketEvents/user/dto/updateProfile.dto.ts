import { IsNumberString, IsOptional, IsString } from "class-validator";

export class UpdateProfileDTO {
    @IsOptional()
    @IsString()
    nickname : string;

    @IsOptional()
    @IsNumberString()
    profile : string;
}