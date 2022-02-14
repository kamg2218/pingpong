import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule} from '@nestjs/typeorm';
import { ormconfig } from 'src/config/ormconfig'
import { AuthModule } from './auth/auth.module';
import { TwoFactorAuthenticationModule } from './two-factor-authentication/twoFactorAuthentication.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [ TypeOrmModule.forRoot(ormconfig),
              AuthModule,
              TwoFactorAuthenticationModule,
              EventsModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}