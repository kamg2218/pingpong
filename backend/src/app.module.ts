import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule} from '@nestjs/typeorm';
import { ormconfig } from 'src/config/ormconfig'
import { AuthModule } from './restRequests/auth/auth.module';
import { TwoFactorAuthenticationModule } from './restRequests/two-factor-authentication/twoFactorAuthentication.module';
import { EventsModule } from './socketEvents/events.module';
import { UserModule } from './restRequests/user/user.module';
import {ServeStaticModule} from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [ TypeOrmModule.forRoot(ormconfig),
              AuthModule,
              TwoFactorAuthenticationModule,
              EventsModule, UserModule,
              ServeStaticModule.forRoot({
                rootPath : join(__dirname, '..', 'views')
              })
            ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
