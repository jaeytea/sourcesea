import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool({ connectionString: config.databaseUrl });

pool.on('error', (err) => {
  // A dropped idle client shouldn't crash the whole server
  console.error('Unexpected Postgres client error', err);
});
