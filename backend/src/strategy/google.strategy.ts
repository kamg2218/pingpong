// import { PassportStrategy } from "@nestjs/passport";
// // import { Strategy } from 'passport-google-oauth2'
// import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
// // import {GoogleOAuthConfig} from 'src/config/google.api';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//     constructor(){
//         super({
//             clientID : GoogleOAuthConfig.clientID,
//             clientSecret : GoogleOAuthConfig.clientSecret,
//             callbackURL : GoogleOAuthConfig.callbackURL,
//             scope : GoogleOAuthConfig.scope,
            
//         });
//     }
//     async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
//         const { name, emails, photos } = profile
//         const user = {
//           email: emails[0].value,
//           firstName: name.givenName,
//           lastName: name.familyName,
//           picture: photos[0].value,
//           accessToken
//         }
//         done(null, user);
//       }
// }
