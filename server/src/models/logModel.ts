import { query } from '../db';

export interface LogEntry {
  timestamp?: Date; // optional since DB defaults to now
  action: 'UPLOAD' | 'EDIT' | 'APPROVE' | 'DENY' | 'EXPORT';
  description: string;
  target: string;
}

// Create a new log entry
export async function addLog(entry: LogEntry): Promise<void> {
  await query(
    `INSERT INTO logs (action, description, target) VALUES ($1, $2, $3)`,
    [entry.action, entry.description, entry.target]
  );
}

// Get all logs
export async function getAllLogs(): Promise<any[]> {
  const result = await query(`SELECT * FROM logs ORDER BY timestamp DESC`);
  return result.rows;
}

// Get logs filtered by action type
export async function getLogsByAction(action: string): Promise<any[]> {
  const result = await query(
    `SELECT * FROM logs WHERE action = $1 ORDER BY timestamp DESC`,
    [action.toUpperCase()]
  );
  return result.rows;
}