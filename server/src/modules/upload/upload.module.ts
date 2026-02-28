import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, callback) => {
          callback(null, uploadsDir);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const baseName = file.fieldname === 'file' ? 'interview' : file.fieldname;
          const customName = baseName + '-' + uniqueSuffix + ext;
          callback(null, customName);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Accept all file types for video uploads
        callback(null, true);
      },
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
      },
    }),
  ],
  controllers: [UploadController]
})
export class UploadModule {}
