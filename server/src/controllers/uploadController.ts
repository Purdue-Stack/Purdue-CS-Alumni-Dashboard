import { Request, Response } from 'express';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { Alumni } from '../models/alumniModel';
import { addLog } from '../models/logModel';

type RowError = { rowIndex: number; messages: string[] };

const CANONICAL_COLUMNS: (keyof Alumni)[] = [
  "First Name",
  "Last Name",
  "Graduation Year",
  "Graduation Term",
  "Outcome Type",
  "Employer",
  "Job Title",
  "Expected Field of Study",
  "Degree Seeking",
  "University",
  "City",
  "State",
  "Base Salary",
  "Signing Bonus",
  "Relocation Reimbursement",
  "Student ID",
  "Degree Level",
  "Salary Pay Period"
];

const REQUIRED_COLUMNS: (keyof Alumni)[] = [
  "First Name",
  "Last Name",
  "Graduation Year"
];

const NUMERIC_COLUMNS = new Set<string>([
  "Graduation Year",
  "Base Salary",
  "Signing Bonus",
  "Relocation Reimbursement",
  "Student ID"
]);

const headerMap = new Map<string, keyof Alumni>(
  CANONICAL_COLUMNS.map((col) => [normalizeHeader(col), col])
);

function normalizeHeader(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeValue(column: keyof Alumni, value: any): { value: any; error?: string } {
  if (value === null || value === undefined) {
    return { value: null };
  }

  if (NUMERIC_COLUMNS.has(column)) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? { value } : { value: null, error: `${column} must be a number` };
    }

    if (typeof value === 'string') {
      const cleaned = value.replace(/[$,]/g, '').trim();
      if (!cleaned) {
        return { value: null };
      }
      const num = Number(cleaned);
      if (!Number.isFinite(num)) {
        return { value: null, error: `${column} must be a number` };
      }
      return { value: num };
    }

    return { value: null, error: `${column} must be a number` };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return { value: trimmed === '' ? null : trimmed };
  }

  return { value: value };
}

function mapRowToCanonical(rawRow: Record<string, any>): Record<keyof Alumni, any> {
  const mapped = {} as Record<keyof Alumni, any>;
  CANONICAL_COLUMNS.forEach((col) => {
    mapped[col] = null;
  });

  Object.entries(rawRow).forEach(([key, value]) => {
    const canonical = headerMap.get(normalizeHeader(key));
    if (canonical) {
      mapped[canonical] = value;
    }
  });

  return mapped;
}

function normalizeRows(rawRows: Record<string, any>[]) {
  const rows: Alumni[] = [];
  const rowErrors: RowError[] = [];

  rawRows.forEach((rawRow, index) => {
    const mapped = mapRowToCanonical(rawRow);
    const messages: string[] = [];
    const normalized = {} as Alumni;

    CANONICAL_COLUMNS.forEach((column) => {
      const result = normalizeValue(column, mapped[column]);
      if (result.error) {
        messages.push(result.error);
      }
      (normalized as any)[column] = result.value ?? null;
    });

    REQUIRED_COLUMNS.forEach((column) => {
      if (
        normalized[column] === null ||
        normalized[column] === undefined ||
        (typeof normalized[column] === 'string' && normalized[column].trim() === '')
      ) {
        messages.push(`${column} is required`);
      }
    });

    if (messages.length > 0) {
      rowErrors.push({ rowIndex: index + 1, messages });
    }

    rows.push(normalized);
  });

  return { rows, rowErrors };
}

async function parseCsvFile(filePath: string): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const results: Record<string, any>[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

function getMissingColumns(rawRows: Record<string, any>[]): string[] {
  if (!rawRows.length) {
    return [...REQUIRED_COLUMNS];
  }

  const rawHeaders = Object.keys(rawRows[0]).map(normalizeHeader);
  const missing: string[] = [];
  REQUIRED_COLUMNS.forEach((col) => {
    if (!rawHeaders.includes(normalizeHeader(col))) {
      missing.push(col);
    }
  });
  return missing;
}

export const uploadExcelPreview = async (req: Request, res: Response): Promise<void> => {
  let filePath: string | null = null;
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
      fs.unlinkSync(file.path);
      res.status(400).json({ error: 'Unsupported file type' });
      return;
    }

    filePath = file.path;
    let rawRows: Record<string, any>[] = [];

    if (ext === '.csv') {
      rawRows = await parseCsvFile(filePath);
    } else {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rawRows = xlsx.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    }

    fs.unlinkSync(filePath);
    filePath = null;

    if (rawRows.length === 0) {
      res.status(400).json({ error: 'No data found in the file' });
      return;
    }

    const missingColumns = getMissingColumns(rawRows);
    const { rows, rowErrors } = normalizeRows(rawRows);
    const totalRows = rows.length;
    const invalidRows = rowErrors.length;
    const validRows = totalRows - invalidRows;

    try {
      await addLog({
        action: 'UPLOAD_PREVIEW',
        description: `Previewed upload file with ${totalRows} rows`,
        target: file.originalname
      });
    } catch (logError) {
      console.error('Failed to write upload preview log:', logError);
    }

    res.status(200).json({
      columns: CANONICAL_COLUMNS,
      rows,
      rowErrors,
      summary: {
        totalRows,
        validRows,
        invalidRows,
        missingColumns
      }
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error('Error reading upload file:', error);
    res.status(500).json({ error: 'Failed to process the file' });
  }
};

export const uploadExcel = uploadExcelPreview;
