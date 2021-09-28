import { Module, CacheModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from 'src/config/jwt.config';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { GoogleStrategy } from './google.strategy';
import { FortyTwoStrategy } from './fortytwo.strategy';


@Module({
  imports : [CacheModule.register({ttl : jwtConstants.refresh_expiresIn_num()}),
    PassportModule, JwtModule.register({
    secret : jwtConstants.secret,
    signOptions : {expiresIn : jwtConstants.access_expiresIn},
  })],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy, FortyTwoStrategy]
})
export class AuthModule {}
