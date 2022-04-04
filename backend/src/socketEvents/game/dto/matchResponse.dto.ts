import { IsBoolean, IsUUID } from "class-validator";

export class MatchResponseDTO {
    @IsUUID()
    requestid : string;

    @IsBoolean()
    result : boolean;
}