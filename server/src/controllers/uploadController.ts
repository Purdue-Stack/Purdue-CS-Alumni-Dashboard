import { Request, Response } from 'express';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import {
  CANONICAL_COLUMNS,
  REQUIRED_COLUMNS,
  buildSuggestedMapping,
  getDuplicateMappingErrors,
  getMissingColumns,
  getMissingRequiredMappings,
  getUnmappedHeaders,
  normalizeRowsWithMapping,
  validateCanonicalRows
} from '../lib/alumniImport';

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

    const rawHeaders = Object.keys(rawRows[0] ?? {});
    const suggestedMapping = buildSuggestedMapping(rawHeaders);
    const missingColumns = getMissingColumns(rawRows);
    const mappingErrors = [
      ...getMissingRequiredMappings(suggestedMapping).map((field) => `${field} must be mapped before validation`),
      ...getDuplicateMappingErrors(suggestedMapping)
    ];
    const totalRows = rawRows.length;

    res.status(200).json({
      rawHeaders,
      rawRows,
      columns: CANONICAL_COLUMNS,
      suggestedMapping,
      requiredFields: REQUIRED_COLUMNS,
      summary: {
        totalRows,
        missingColumns,
        unmappedHeaders: getUnmappedHeaders(rawHeaders, suggestedMapping),
        mappingErrors
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

export const validateUploadData = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawRows = Array.isArray(req.body.rawRows) ? req.body.rawRows : null;
    const rows = Array.isArray(req.body.rows) ? req.body.rows : null;
    const mapping = typeof req.body.mapping === 'object' && req.body.mapping ? req.body.mapping : {};

    if ((!rawRows || rawRows.length === 0) && (!rows || rows.length === 0)) {
      res.status(400).json({ error: 'No rows provided for validation' });
      return;
    }

    let validationResult;
    let missingMappings: string[] = [];
    let duplicateMappings: string[] = [];

    if (rawRows && rawRows.length > 0) {
      missingMappings = getMissingRequiredMappings(mapping);
      duplicateMappings = getDuplicateMappingErrors(mapping);

      if (missingMappings.length || duplicateMappings.length) {
        res.status(400).json({
          error: 'Upload mapping is incomplete',
          mappingErrors: [
            ...missingMappings.map((field) => `${field} must be mapped before validation`),
            ...duplicateMappings
          ]
        });
        return;
      }

      validationResult = normalizeRowsWithMapping(rawRows, mapping);
    } else {
      validationResult = validateCanonicalRows(rows ?? []);
    }

    const totalRows = validationResult.rows.length;
    const invalidRows = validationResult.rowErrors.length;
    const validRows = totalRows - invalidRows;

    res.status(200).json({
      columns: CANONICAL_COLUMNS,
      rows: validationResult.rows,
      rowErrors: validationResult.rowErrors,
      fieldErrors: validationResult.fieldErrors,
      summary: {
        totalRows,
        validRows,
        invalidRows
      }
    });
  } catch (error) {
    console.error('Error validating upload data:', error);
    res.status(500).json({ error: 'Failed to validate upload data' });
  }
};
