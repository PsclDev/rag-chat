import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './data/temp',
        filename: (_, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [FileUploadController, FileController],
  providers: [FileUploadService, FileService],
})
export class FileModule {}
