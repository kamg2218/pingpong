import { Module } from '@nestjs/common';
import { AuthModule } from 'src/restRequests/auth/auth.module';
import { TwoFactorAuthenticationController } from './twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { JwtStrategy } from 'src/strategy/jwt.strategy';
@Module({
    imports: [AuthModule],
    controllers: [TwoFactorAuthenticationController],
    providers: [JwtStrategy, TwoFactorAuthenticationService]
})
export class TwoFactorAuthenticationModule {}
