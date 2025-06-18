import { Request, Response } from 'express';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import path from 'path';
import { insertManyAlumni, Alumni } from '../models/alumniModel';
import { addLog } from '../models/logModel';

export const uploadExcel = (req: Request, res: Response): void => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const ext = path.extname(file.originalname);
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
      fs.unlinkSync(file.path); // remove unsupported file
      res.status(400).json({ error: 'Unsupported file type' });
      return;
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData: Alumni[] = xlsx.utils.sheet_to_json(worksheet);
    fs.unlinkSync(file.path); // remove file after parsing

    if (jsonData.length === 0) {
      res.status(400).json({ error: 'No data found in the file' });
      return;
    }

    // Validate data structure
    const requiredFields = [
      'Name', 'Graduation Year', 'Graduation Term', 'Outcome Type',
      'Employer', 'Job Title', 'Field of Study', 'Degree Seeking',
      'University', 'City', 'State', 'Base Salary',
      'Signing Bonus', 'Relocation Reimbursement', 'Student ID',
      'Degree Level', 'Salary Period'
    ];
    for (const row of jsonData) {
      for (const field of requiredFields) {
        if (!(field in row)) {
          res.status(400).json({ error: `Missing required field: ${field}` });
          return;
        }
      }
    }

    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Failed to process the file' });
  }
};

export const saveEditedData = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: Alumni[] = req.body.data;
    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({ error: 'No data received' });
      return;
    }

    await insertManyAlumni(data);

    // Log the action
    await addLog({
      action: 'UPLOAD',
      description: `Saved ${data.length} alumni records`,
      target: req.body.filename || 'Alumni Data'
    });
    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error inserting data into DB:', error);
    res.status(500).json({ error: 'Failed to save data to the database' });
  }
};