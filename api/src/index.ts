import dotenv from 'dotenv';
import app from './app.js';
import { initSocket } from './socket.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

const httpServer = initSocket(app);

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server (HTTP + WebSocket) is running on http://0.0.0.0:${PORT}`);
});
