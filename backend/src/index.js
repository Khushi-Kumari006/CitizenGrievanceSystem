const path = require('path');
const dotenv = require('dotenv');

// Explicitly load .env from the backend root folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = require('./app');

const PORT = parseInt(process.env.PORT, 10) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection! Shutting down server...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception! Shutting down server...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown on termination signals
const handleShutdown = (signal) => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.once('SIGUSR2', () => {
  server.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

module.exports = server;

