import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
import { setupSwagger } from 'src/util/SetupSwagger'
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import {Database, Resource} from '@adminjs/typeorm';
import { User } from './db/entity/User/UserEntity';

AdminJS.registerAdapter({Database, Resource});
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const adminJs = new AdminJS({
    
    resources : [{
      resource : User
    }],
    rootPath : '/admin',
  });
  const router = AdminJSExpress.buildRouter(adminJs);
  app.use(adminJs.options.rootPath, router);
  setupSwagger(app);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist : true,
      forbidNonWhitelisted : true,
      transform : true
    })
  )
  app.enableCors({
    origin : ["http://localhost:3000", "https://admin.socket.io"],
    credentials : true,
  });
 

  await app.listen(4242);

}
bootstrap();
