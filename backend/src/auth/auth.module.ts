import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from 'src/config/jwt.config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { FortyTwoStrategy } from './strategy/fortytwo.strategy';
import { RefreshStrategy } from './strategy/refresh.strategy';
import { Logger } from '@nestjs/common';
import { JwtAuthenticationStrategy } from './strategy/jwt-2fa.strategy';
import { UnauthorizedExceptionFilter } from 'src/filter/UnauthorizedExceptionFilter';

@Module({
  imports : [
    PassportModule, 
    JwtModule.register({
      secret : jwtConstants.secret,
      signOptions : {expiresIn : jwtConstants.access_expiresIn}}),
  ],
  controllers: [AuthController],
  providers: [UnauthorizedExceptionFilter, Logger, AuthService, JwtStrategy, JwtAuthenticationStrategy, FortyTwoStrategy, RefreshStrategy],
  exports : [JwtModule, AuthService, Logger, JwtStrategy]
})

export class AuthModule {
}
