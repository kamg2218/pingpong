import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from 'src/config/jwt.config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { FortyTwoStrategy } from './strategy/fortytwo.strategy';
import { CustomStrategy } from './strategy/custom.strategy';


@Module({
  imports : [PassportModule, JwtModule.register({
    secret : jwtConstants.secret,
    signOptions : {expiresIn : jwtConstants.access_expiresIn},
  }),],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, FortyTwoStrategy, CustomStrategy ]
})
export class AuthModule {
}
