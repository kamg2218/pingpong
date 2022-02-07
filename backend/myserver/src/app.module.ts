import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule} from '@nestjs/typeorm';
import { ormconfig } from 'src/config/ormconfig'
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ TypeOrmModule.forRoot(ormconfig),
              AuthModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
