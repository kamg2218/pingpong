import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
import { setupSwagger } from 'src/util/SetupSwagger'
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import {Database, Resource} from '@adminjs/typeorm';
import { BlockedFriends, Friends, User } from './db/entity/User/UserEntity';
import { CORS_ORIGIN } from './config/const';
import {NestExpressApplication} from '@nestjs/platform-express'
import {join} from 'path';
AdminJS.registerAdapter({Database, Resource});
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const adminJs = new AdminJS({
    
    resources : [User, Friends, BlockedFriends],
    rootPath : '/admin',
  });
  const ADMIN = {
    email : 'admin@aa.com',
    password : '1234'
  }
  const router = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate : async (email, password) => {
      if (ADMIN.password === password && ADMIN.email === email) {
        return true;
      }
      return null;
    },
    cookieName : 'adminJS',
    cookiePassword : 'testtest'
  })
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
    origin : CORS_ORIGIN,
    credentials : true,
  });
  await app.listen(4242);

}
bootstrap();
