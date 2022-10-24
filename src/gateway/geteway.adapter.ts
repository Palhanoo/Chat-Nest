import { IoAdapter } from '@nestjs/platform-socket.io';
import { getRepository } from 'typeorm';
import { AuthenticatedSocket } from '../utils/interfaces';
import { Session, User } from '../utils/typeorm';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie';
import { plainToInstance } from 'class-transformer';

export class WebsocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const sessionRepository = getRepository(Session);
    const server = super.createIOServer(port, options);
    server.use(async (socket: AuthenticatedSocket, next) => {
      // console.log(socket.handshake.headers.cookie);
      const { cookie: clientCookie } = socket.handshake.headers;
      if (!clientCookie) {
        console.log('Not Authenticated');
        return next(new Error('No Cookies were sent'));
      }
      const { CHAT_APP_SESSION_ID } = cookie.parse(clientCookie);
      if (!CHAT_APP_SESSION_ID) {
        console.log('CHAT_APP_SESION_ID not exist');
        return next(new Error('No Cookies'));
      }
      // console.log(CHAT_APP_SESSION_ID);
      const signedCookie = cookieParser.signedCookie(
        CHAT_APP_SESSION_ID,
        process.env.COOKIE_SECRET,
      );
      // console.log(signedCookie);
      if (!signedCookie) return next(new Error('No signedCookie'));
      const sessionDB = await sessionRepository.findOne({ id: signedCookie });
      if (!sessionDB) return next(new Error('Error in socket'));
      const userDB = plainToInstance(
        User,
        JSON.parse(sessionDB.json).passport.user,
      );
      socket.user = userDB;
      next();
    });
    return server;
  }
}
