import { Request, Response } from 'express';
import { getClient } from '../db';
import {
  insertAlumni,
  updateAlumniByStudentId,
  updateAlumniByNameGradYear,
  findAlumniByStudentId,
  findAlumniByNameGradYear,
  Alumni
} from '../models/alumniModel';
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

export const commitUpload = async (req: Request, res: Response): Promise<void> => {
  const client = await getClient();
  try {
    const data = Array.isArray(req.body.rows) ? req.body.rows : req.body.data;
    const filename = req.body.filename || 'Alumni Data';

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({ error: 'No data received' });
      return;
    }

    const { rows, rowErrors } = normalizeRows(data);
    const errorIndex = new Set(rowErrors.map((err) => err.rowIndex));
    const seen = new Set<string>();
    const result = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: rowErrors.length
    };

    await client.query('BEGIN');

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (errorIndex.has(i + 1)) {
        continue;
      }

      const studentId = row["Student ID"];
      const dedupeKey = studentId
        ? `student:${studentId}`
        : `name:${row["First Name"]}|${row["Last Name"]}|${row["Graduation Year"]}`;

      if (seen.has(dedupeKey)) {
        result.skipped += 1;
        continue;
      }
      seen.add(dedupeKey);

      let existing: Alumni | null = null;
      if (studentId) {
        existing = await findAlumniByStudentId(Number(studentId), client);
      } else {
        existing = await findAlumniByNameGradYear(
          row["First Name"],
          row["Last Name"],
          row["Graduation Year"],
          client
        );
      }

      if (existing) {
        if (studentId) {
          await updateAlumniByStudentId(row, client);
        } else {
          await updateAlumniByNameGradYear(row, client);
        }
        result.updated += 1;
      } else {
        await insertAlumni(row, client);
        result.inserted += 1;
      }
    }

    try {
      await addLog({
        action: 'UPLOAD',
        description: `Committed upload: ${result.inserted} inserted, ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`,
        target: filename
      }, client);
    } catch (logError) {
      console.error('Failed to write upload commit log:', logError);
    }

    await client.query('COMMIT');

    res.status(200).json({
      ...result,
      rowErrors
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting data into DB:', error);
    res.status(500).json({ error: 'Failed to save data to the database' });
  } finally {
    client.release();
  }
};

export const saveEditedData = commitUpload;
