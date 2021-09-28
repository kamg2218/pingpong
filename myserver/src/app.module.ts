import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule} from '@nestjs/typeorm';
import { ormconfig } from 'src/config/ormconfig'
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';


@Module({
  imports: [ TypeOrmModule.forRoot(ormconfig), AuthModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
