import { query } from '../db';
import type { PoolClient } from 'pg';

export interface LogEntry {
  timestamp?: Date; // optional since DB defaults to now
  action: 'UPLOAD' | 'EDIT' | 'APPROVE' | 'DENY' | 'EXPORT';
  target: string;
  totalRowsRead?: number | null;
  errors?: number | null;
  totalUploaded?: number | null;
}

type Queryable = Pick<PoolClient, 'query'>;

// Create a new log entry
export async function addLog(entry: LogEntry, client?: Queryable): Promise<void> {
  const executor = client ?? { query };
  await executor.query(
    `INSERT INTO admin_logs (action, target, total_rows_read, errors, total_uploaded) VALUES ($1, $2, $3, $4, $5)`,
    [
      entry.action,
      entry.target,
      entry.totalRowsRead ?? null,
      entry.errors ?? null,
      entry.totalUploaded ?? null
    ]
  );
}

// Get all logs
export async function getAllLogs(): Promise<any[]> {
  const result = await query(`SELECT * FROM admin_logs ORDER BY timestamp DESC`);
  return result.rows;
}

// Get logs filtered by action type
export async function getLogsByAction(action: string): Promise<any[]> {
  const result = await query(
    `SELECT * FROM admin_logs WHERE action = $1 ORDER BY timestamp DESC`,
    [action.toUpperCase()]
  );
  return result.rows;
}
