import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, { cors: true });

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Register global interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Add this line to enable automatic body parsing and validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(process.env.PORT || 3001);
}
void bootstrap();
