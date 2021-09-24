import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { GoogleStrategy } from './google.strategy';
import { FortyTwoStrategy } from './fortytwo.strategy';

@Module({
  imports : [PassportModule, JwtModule.register({
    secret : jwtConstants.secret,
    signOptions : {expiresIn : '10m'},
  })],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy, FortyTwoStrategy]
})
export class AuthModule {}
