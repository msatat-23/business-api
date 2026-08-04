import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);

  // --- Security headers -----------------------------------------------
  app.use(helmet());

  // --- CORS --------------------------------------------------------------
  const corsOrigins = configService.get<string[]>('corsOrigins') ?? [];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // --- Global validation ---------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties not declared in the DTO
      forbidNonWhitelisted: true, // reject requests with unknown properties
      transform: true, // auto-transform payloads to DTO instances
      // NOTE: deliberately NOT using transformOptions.enableImplicitConversion.
      // class-transformer's implicit conversion recursively tries to coerce
      // array elements into the array's own reflected type when no explicit
      // element type is declared (as with our loosely-typed JSONB DTO fields
      // like UpdatePageDto.roadmap: any[]), which silently turns arrays of
      // objects into arrays of empty arrays. Not needed for JSON bodies.
    }),
  );

  // --- API versioning / prefix ----------------------------------------
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // --- Graceful shutdown ------------------------------------------------
  app.enableShutdownHooks();

  // --- Swagger docs -----------------------------------------------------
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('port') ?? 3001;
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`, 'Bootstrap');
}

bootstrap();
