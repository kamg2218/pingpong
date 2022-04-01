import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
import { setupSwagger } from 'src/config/SetupSwagger'
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/typeorm';
import { BlockedFriends, Friends, User } from './db/entity/User/UserEntity';

const { instrument } = require("@socket.io/admin-ui");

AdminJS.registerAdapter({Database, Resource});
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    origin : ["https://admin.socket.io"],
    credentials : true,
  });

  // console.log(ENV.parsed);
  await app.listen(4242);

}
bootstrap();
