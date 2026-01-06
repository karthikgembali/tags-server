// Module Imports
import path from 'path';
import fs from 'fs';
import multer from 'multer';

// establishing uploads folder directory
const uploadFolder = path.join(process.cwd(), 'uploads')

// checking if the uploads folder exists, if not, creating it
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true })
}

// configuring multer to upload files to the uploads folder
export const fileUpload = multer({ dest: uploadFolder })
