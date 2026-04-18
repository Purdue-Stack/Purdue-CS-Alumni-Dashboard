import express from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { uploadExcel } from '../controllers/uploadController';
import { saveEditedData } from '../controllers/commitController';

const router = express.Router();

// Use the runtime temp directory so uploads work on serverless hosts.
const upload = multer({ dest: path.join(os.tmpdir(), 'purdue-cs-alumni-dashboard-admin-uploads') });

// Route for uploading file
router.post('/upload-file', upload.single('file'), uploadExcel);

// Route for saving edited data
router.post('/save-edited-data', saveEditedData);

export default router;
