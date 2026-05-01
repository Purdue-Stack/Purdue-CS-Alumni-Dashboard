#!/usr/bin/env node

import app from '../app';
import debug from 'debug';
import http from 'http';
import { AddressInfo } from 'net';
import { query } from '../db'; // Import the query function from db.ts

const debugLog = debug('server:server');

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string): number | string | boolean {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(): void {
  const addr = server.address() as AddressInfo;
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debugLog('Listening on ' + bind);

  // Test Neon DB connection
  query('SELECT "First Name", "Last Name", "Graduation Year" FROM alumni LIMIT 5;')
    .then((res: { rows: Array<Record<string, unknown>> }) => {
      console.log('DB connected. Sample rows:');
      res.rows.forEach((row: Record<string, unknown>, i: number) => {
        console.log(`${i + 1}. ${row['First Name']} ${row['Last Name']} (${row['Graduation Year']})`);
      });
    })
    .catch((err: Error) => {
      console.error('Failed to connect to DB or fetch data:', err.message);
    });
}
