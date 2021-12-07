import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import AdminBro from 'admin-bro';
import AdminBroExpress from '@admin-bro/express';
import { setupSwagger } from 'src/util/SetupSwagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const adminBro = new AdminBro({
  //   rootPath : '/admin'
  // })
  setupSwagger(app);
  // const router = AdminBroExpress.buildRouter(adminBro)
  // app.use(adminBro.options.rootPath, router);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist : true,
      forbidNonWhitelisted : true,
      transform : true
    })
  )
  app.enableCors({
    origin : "http://localhost:3000",
    credentials : true,
  });
 
  await app.listen(4242);



}
bootstrap();
