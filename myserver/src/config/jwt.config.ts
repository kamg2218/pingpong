export const jwtConstants = {
    secret : 'secretKey',
    access_expiresIn : '3m',
    refresh_expiresIn : '5m',
    refresh_expiresIn_num() {
        return 5 * 60;
    }
}

