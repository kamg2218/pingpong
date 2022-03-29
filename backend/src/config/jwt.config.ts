import dotenv from 'dotenv'
import { ENV_PATH } from "src/config/url";

const ENV = dotenv.config({path : ENV_PATH});
export const jwtConstants = {
    secret : ENV.parsed.JWT_SECRET,
    access_expiresIn : ENV.parsed.JWT_EXPIRE_AT,
    refresh_expiresIn : ENV.parsed.JWT_EXPIRE_RT,
    
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

