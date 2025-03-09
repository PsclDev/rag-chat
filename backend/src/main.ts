import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  const config = app.get(ConfigService);

  if (config.printConfig) {
    config.printAppConfig();
  }

  app.enableCors();
  await app.listen(config.port);
  logger.log(`Server is running on port ${config.port}`);
}

bootstrap();
