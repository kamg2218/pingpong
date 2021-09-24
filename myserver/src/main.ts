import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnauthorizedExceptionFilter } from './auth/unauthorized-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.useGlobalFilters(new UnauthorizedExceptionFilter())
  app.enableCors({
    origin : "http://localhost:3001",
  });
  await app.listen(3000);
}
bootstrap();
