import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TwoFactorAuthenticationController } from 'src/two-factor-authentication/twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';

@Module({
    imports: [AuthModule],
    controllers: [TwoFactorAuthenticationController],
    providers: [TwoFactorAuthenticationService]
})
export class TwoFactorAuthenticationModule {}
