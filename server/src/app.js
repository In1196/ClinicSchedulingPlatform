import express from 'express';

// The Express app is created here, separately from server.js, so that
// automated tests can import and exercise the app without starting a
// real network listener.
export function createApp() {
  const app = express();

  app.use(express.json());

  // Basic health check endpoint. Useful for confirming the server is
  // running and for future deployment/monitoring checks.
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
