import { Socket } from 'socket.io';
import { ChatHandler } from './chat-handler';
import { TripHandler } from './trip-handler';


export function registerHandlers(io: any, socket: Socket) {
  const tripHandler = new TripHandler(io);
  tripHandler.register(socket);
  
  const chatHandler = new ChatHandler(io);
  chatHandler.register(socket);
}