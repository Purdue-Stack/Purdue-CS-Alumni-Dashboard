import express from 'express';
import multer from 'multer';
import { uploadExcel, saveEditedData } from '../controllers/uploadController';

const router = express.Router();

// Set multer to save uploads to the /uploads folder
const upload = multer({ dest: 'src/uploads/' });

// Route for uploading file
router.post('/upload-file', upload.single('file'), uploadExcel);

// Route for saving edited data
router.post('/save-edited-data', saveEditedData);

export default router;
