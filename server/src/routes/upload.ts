import express, { Request, Response, NextFunction, Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

const router: Router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (allowedTypes.includes(file.mimetype) ||
            file.originalname.toLowerCase().match(/\.(csv|xls|xlsx)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload CSV or Excel files only.'));
        }
    }
});

// Mock database for upload logs (replace with real database)
let uploadLogs: any[] = [
    {
        id: '1',
        userName: 'John Langenkamp',
        uploadDate: '2023-11-14T10:30:00Z',
        fileName: 'View Data Set',
        avatar: '/images/user-avatar.png'
    },
    {
        id: '2',
        userName: 'Bob Paden',
        uploadDate: '2023-11-13T15:45:00Z',
        fileName: '2023 Alumni Update',
        avatar: '/images/user-avatar.png'
    },
    {
        id: '3',
        userName: 'Bob Paden',
        uploadDate: '2023-11-02T09:20:00Z',
        fileName: '2023 New Job',
        avatar: '/images/user-avatar.png'
    },
    {
        id: '4',
        userName: 'Bob Paden',
        uploadDate: '2023-10-12T14:10:00Z',
        fileName: '2023 Salary info',
        avatar: '/images/user-avatar.png'
    },
    {
        id: '5',
        userName: 'Bob Paden',
        uploadDate: '2023-10-03T11:55:00Z',
        fileName: '2023 Salary info',
        avatar: '/images/user-avatar.png'
    }
];

// Upload file endpoint
router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileExtension = path.extname(fileName).toLowerCase();

        let data: any[] = [];
        let recordsProcessed = 0;

        try {
            if (fileExtension === '.csv') {
                // Process CSV file
                data = await processCsvFile(filePath);
            } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
                // Process Excel file
                data = await processExcelFile(filePath);
            } else {
                throw new Error('Unsupported file format');
            }

            recordsProcessed = data.length;

            // Here you would typically save the data to your database
            // For now, we'll just validate the structure
            if (data.length === 0) {
                throw new Error('No data found in the uploaded file');
            }

            // Add to upload log
            const newLog = {
                id: Date.now().toString(),
                userName: 'JOHN L', // This should come from authentication
                uploadDate: new Date().toISOString(),
                fileName: fileName,
                avatar: '/images/user-avatar.png',
                recordsCount: recordsProcessed
            };
            uploadLogs.unshift(newLog);

            // Clean up uploaded file
            fs.unlinkSync(filePath);

            res.json({
                message: 'File uploaded and processed successfully',
                recordsProcessed: recordsProcessed,
                fileName: fileName
            });

        } catch (processingError) {
            // Clean up uploaded file on error
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw processingError;
        }

    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            message: error.message || 'Failed to process uploaded file'
        });
    }
});

// Get upload logs endpoint
router.get('/upload-log', (req: Request, res: Response) => {
    res.json(uploadLogs);
});

// Process CSV file
async function processCsvFile(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const results: any[] = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Validate and process each row
                if (validateAlumniData(data)) {
                    results.push(data);
                }
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Process Excel file
// Process Excel file using xlsx
function processExcelFile(filePath: string): Promise<any[]> {
    try {
        // Read the Excel file
        const workbook = XLSX.readFile(filePath);

        // Get the first sheet name
        const sheetNames = workbook.SheetNames;
        if (sheetNames.length === 0) {
            throw new Error('No worksheets found in Excel file');
        }

        let worksheet = null;

        // Try to find a sheet with data
        for (const sheetName of sheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

            // Check if sheet has more than just header row
            if (range.e.r > 0) {
                worksheet = sheet;
                break;
            }
        }

        if (!worksheet) {
            throw new Error('No data found in any worksheet');
        }

        // Convert sheet to JSON with options
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // Use array of arrays format first to get headers
            defval: null, // Default value for empty cells
            blankrows: false // Skip blank rows
        }) as any[][];

        if (rawData.length === 0) {
            throw new Error('No data rows found in worksheet');
        }

        // Extract headers from first row
        const headers = rawData[0].map((header: any, index: number) => {
            if (header === null || header === undefined || header === '') {
                return `Column_${index + 1}`;
            }
            return String(header).trim();
        });

        // Process data rows (skip header row)
        const data: any[] = [];
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];

            // Skip completely empty rows
            if (row.every(cell => cell === null || cell === undefined || cell === '')) {
                continue;
            }

            const rowData: any = {};
            let hasData = false;

            // Map row data to headers
            headers.forEach((header, index) => {
                let cellValue = row[index];

                // Clean up cell value
                if (cellValue !== null && cellValue !== undefined) {
                    if (typeof cellValue === 'string') {
                        cellValue = cellValue.trim();
                        if (cellValue === '') {
                            cellValue = null;
                        }
                    }
                    if (cellValue !== null) {
                        hasData = true;
                    }
                }

                rowData[header] = cellValue;
            });

            // Only add rows that have at least some data
            if (hasData && validateAlumniData(rowData)) {
                data.push(rowData);
            }
        }

        return Promise.resolve(data);
    } catch (error) {
        console.error('Error processing Excel file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return Promise.reject(new Error(`Failed to process Excel file: ${errorMessage}`));
    }
}

// Validate alumni data structure
function validateAlumniData(data: any): boolean {
    // Add your validation logic here
    // This is a basic example - adjust based on your data requirements
    const requiredFields = ['name', 'graduationYear', 'major'];

    for (const field of requiredFields) {
        if (!data[field] || data[field].toString().trim() === '') {
            return false;
        }
    }

    return true;
}

export default router;