import { Request, Response } from 'express';
import { getAllLogs, getLogsByAction, LogEntry } from '../models/logModel';

// GET /api/admin/logs
export const fetchAllLogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await getAllLogs();
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/logs/:action
export const fetchLogsByAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action } = req.params;
    const logs = await getLogsByAction(action);
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs by action:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};