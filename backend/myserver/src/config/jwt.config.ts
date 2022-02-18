export const jwtConstants = {
    secret : 'secretKey',
    access_expiresIn : '30m',
    refresh_expiresIn : '50m',
    
    getByms(type : string) : number {
        if (type !== 'at' &&  type !== 'rt')
            throw new Error("Invalid type")
        const time = type === 'at' ? this.access_expiresIn : this.refresh_expiresIn;
        const length = time.length;
        const unit = time.substring(length - 1, length);
        const value = time.substring(0, length - 1);
        if (unit === 's')
            return (Number(value) * 1000);
        else if (unit === 'm')
            return (Number(value) * 1000 * 60);
        else if (unit === 'h')
            return (Number(value) * 1000 * 3600);
    }
}

