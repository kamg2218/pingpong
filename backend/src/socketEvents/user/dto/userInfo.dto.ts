import { IsUUID } from "class-validator";

export class UserInfoDTO {
    @IsUUID()
    userid : string;
}