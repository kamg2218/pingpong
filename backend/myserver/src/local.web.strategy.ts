// import { Strategy } from 'passport-local';
// import {  PassportStrategy } from '@nestjs/passport';
// import {Injectable, UnauthorizedException} from '@nestjs/common';

// @Injectable()
// export class WsLocalStrategy extends PassportStrategy(Strategy) {
    
//     constructor() {
//         super({usernameField : 'email'});

//     }

//     async validate(email : string, password : string) {
//         console.log("validata!!!!!!");
//        if (email == "jikwon@gmail.com" && password == "pass")
//             return ({eamil : email, passwrod : password});
//         return null;
//     }
// }