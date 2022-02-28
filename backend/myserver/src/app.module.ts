import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule} from '@nestjs/typeorm';
import { ormconfig } from 'src/config/ormconfig'
import { AuthModule } from './auth/auth.module';
import { TwoFactorAuthenticationModule } from './two-factor-authentication/twoFactorAuthentication.module';
import { EventsModule } from './events/events.module';
import { UserModule } from './user/user.module';
import {ServeStaticModule} from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [ TypeOrmModule.forRoot(ormconfig),
              AuthModule,
              TwoFactorAuthenticationModule,
              EventsModule, UserModule,
              ServeStaticModule.forRoot({
                rootPath : join(__dirname, '..', 'src/views')
              })
            ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}