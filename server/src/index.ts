import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const { httpServer } = createApp();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
