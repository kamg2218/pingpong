import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist : true,
      forbidNonWhitelisted : true,
    })
  )
  app.enableCors({
    origin : "http://localhost:3000",
  });
  await app.listen(4242);
}
bootstrap();
