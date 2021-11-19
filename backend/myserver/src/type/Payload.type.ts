export interface JWT_PAYLOAD {
    type? : "refresh" | "access",
    id? : string,
}