import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
import { setupSwagger } from 'src/config/SetupSwagger'
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/typeorm';
import { BlockedFriends, Friends, User } from './db/entity/User/UserEntity';
import { ChatRoom, ChatHistory, ChatMembership } from './db/entity/Chat/ChatEntity';
import { GameRoom } from './db/entity/Game/GameRoom.entity';
import { ENV_PATH } from "src/config/url";
import dotenv from 'dotenv'
import { GameMembership } from './db/entity/Game/GameMembership.entity';
const ENV = dotenv.config({path : ENV_PATH});
const { instrument } = require("@socket.io/admin-ui");

AdminJS.registerAdapter({Database, Resource});
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const adminJs = new AdminJS({
    resources : [User, Friends, BlockedFriends, ChatRoom, ChatHistory, GameRoom, ChatMembership, GameMembership],
    rootPath : '/admin',
  });
  const ADMIN = {
    email : 'admin@aa.com',
    password : ENV.parsed.ADMINPWD,
  }
  const router = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate : async (email, password) => {
      if (ADMIN.password === password && ADMIN.email === email) {
        return true;
      }
      return null;
    },
    cookieName : 'adminJS',
    cookiePassword : ENV.parsed.ADMINCOOKIEPWD
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
  await app.listen(4242);

}
bootstrap();
