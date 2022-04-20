import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TwoFactorAuthenticationController } from 'src/two-factor-authentication/twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
@Module({
    imports: [AuthModule],
    controllers: [TwoFactorAuthenticationController],
    providers: [JwtStrategy, TwoFactorAuthenticationService]
})
export class TwoFactorAuthenticationModule {}
