import { IsBoolean } from "class-validator"
import { UserInfoDTO } from "./userInfo.dto"

export class NewFriendDTO extends UserInfoDTO {
    @IsBoolean()
    result : boolean;
}