import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { TypeormStore } from 'connect-typeorm/out';
import { getRepository } from 'typeorm';
import { Session } from './utils/typeorm/entities/Session';
import { WebsocketAdapter } from './gateway/geteway.adapter';

async function bootstrap() {
  const { PORT, COOKIE_SECRET } = process.env;
  const app = await NestFactory.create(AppModule);
  const sessionRepository = getRepository(Session);
  const adapter = new WebsocketAdapter(app);
  app.useWebSocketAdapter(adapter);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  app.useGlobalPipes(new ValidationPipe());

  app.use(
    session({
      secret: COOKIE_SECRET,
      saveUninitialized: false,
      resave: false,
      name: 'CHAT_APP_SESSION_ID', // CHANGE THE COOKIE NAME AFTER
      cookie: {
        maxAge: 86400000, // 1 day for cookie expire
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  try {
    await app.listen(PORT, () => console.log(`Running in port ${PORT}`));
  } catch (err) {
    console.log(err);
  }
}
bootstrap();
