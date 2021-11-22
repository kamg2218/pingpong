// import axios, {AxiosRequestConfig} from "axios";
// import moment from "moment";

export function setCookie(){
    const now = new Date();
    now.setTime(now.getTime() + 1000 * 100);
    console.log(now);
    document.cookie = `accesstoken=yummyCookie; expires=${now.toUTCString()}`;
}

function getCookie() {
    const cookie = document.cookie;
    console.log(cookie);
}

setCookie();
getCookie();