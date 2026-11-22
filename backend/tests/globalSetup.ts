import http from 'http';
import { app } from '../src/server';
import { config } from '../src/config/env';

let server: http.Server | null = null;

export async function setup() {
  await new Promise<void>((resolve, reject) => {
    server = app.listen(config.PORT, () => {
      resolve();
    });
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // Server already listening on this port, reuse it
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

export async function teardown() {
  if (server) {
    await new Promise<void>((resolve) => {
      server!.close(() => resolve());
    });
  }
}
