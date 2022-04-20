import { IsBoolean, IsString } from "class-validator";

export class InviteGameRoomResponseDTO {
    @IsString()
    requestid : string;

    @IsBoolean()
    result : boolean;
}