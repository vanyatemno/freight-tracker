import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { flattenValidationErrors } from './shared';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_CONFIG_NAME, LoggerFactory } from './infrastracture';

async function bootstrap() {
  const loggerInstance = LoggerFactory.create('freight-tracker');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({ instance: loggerInstance }),
    cors: {
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      origin: '*',
      credentials: true,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors) => {
        const errors = flattenValidationErrors(validationErrors);
        throw new UnprocessableEntityException({
          message: 'Validation Error',
          errors,
        });
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Freight-Tracker')
    .setDescription('Freight-Tracker API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);

  const configService = app.get(ConfigService);
  const { port } = configService.get(APP_CONFIG_NAME);

  await app.listen(port);
}
bootstrap();
