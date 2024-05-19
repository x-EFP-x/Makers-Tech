import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import handleSocketConnection from '../sockets/socket.js';

const server = createServer(app);
const io = new Server(server, { connectionStateRecovery: {} });
const port = 3000;

io.on('connection', handleSocketConnection);

server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

export { io };
