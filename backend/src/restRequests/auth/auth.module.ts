import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from 'src/config/jwt.config';
import { JwtStrategy } from 'src/strategy/jwt.strategy';
import { FortyTwoStrategy } from 'src/strategy/fortytwo.strategy';
import { RefreshStrategy } from 'src/strategy/refresh.strategy';
import { Logger } from '@nestjs/common';
import { JwtAuthenticationStrategy } from 'src/strategy/jwt-2fa.strategy';

@Module({
  imports : [
    PassportModule, 
    JwtModule.register({
      secret : jwtConstants.secret,
      signOptions : {expiresIn : jwtConstants.access_expiresIn}}),
  ],
  controllers: [AuthController],
  providers: [Logger, AuthService, JwtStrategy, JwtAuthenticationStrategy, FortyTwoStrategy, RefreshStrategy],
  exports : [JwtModule, Logger, AuthService]
})

export class AuthModule {
}
