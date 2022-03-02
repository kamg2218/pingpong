import { IsUUID } from "class-validator";

export class MatchRequestDTO {
    @IsUUID()
    userid : string;
}