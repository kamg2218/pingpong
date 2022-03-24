import { env } from "process";

export const DELAYEDDAY = 7;
export const SALTROUND = 10;


export const BACK_DOMAIN = "localhost";
// export const BACK_DOMAIN = env.DB_HOST ? env.DB_HOST : "localhost";
// export const BACK_ADDR = "http://" + BACK_DOMAIN + ":4242"
export const FRONTADDR = "http://localhost:4242";
// export const FRONTADDR = "http://" + BACK_DOMAIN + ":4242";

export const CORS_ORIGIN = ["http://localhost:3000", "http://localhost:3000/game", "192.168.219.105:3000", "192.168.219.107:3000"];
