import { Request, Response } from 'express';
import { getClient } from '../db';
import {
  insertAlumni,
  updateAlumniByImportIdentity,
  findAlumniByImportIdentity,
  Alumni
} from '../models/alumniModel';
import { addLog } from '../models/logModel';
import {
  buildImportIdentityKey,
  validateCanonicalRows
} from '../lib/alumniImport';

export const commitUpload = async (req: Request, res: Response): Promise<void> => {
  const client = await getClient();
  try {
    const data = Array.isArray(req.body.rows) ? req.body.rows : req.body.data;
    const filename = req.body.filename || 'Alumni Data';

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({ error: 'No data received' });
      return;
    }

    const { rows, rowErrors, fieldErrors } = validateCanonicalRows(data);
    if (rowErrors.length > 0) {
      res.status(400).json({
        error: 'Upload data failed validation',
        rowErrors,
        fieldErrors
      });
      return;
    }
    const errorIndex = new Set(rowErrors.map((err) => err.rowIndex));
    const seen = new Set<string>();
    const result = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };

    await client.query('BEGIN');

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (errorIndex.has(i + 1)) {
        continue;
      }

      const dedupeKey = buildImportIdentityKey(row as Alumni);
      if (seen.has(dedupeKey)) {
        result.skipped += 1;
        continue;
      }
      seen.add(dedupeKey);

      const existing = await findAlumniByImportIdentity(row, client);
      if (existing) {
        await updateAlumniByImportIdentity(row, client);
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
