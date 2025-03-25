import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { FileUploadService } from './file-upload.service';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [
    MulterModule.register({
      fileFilter: (_, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        cb(null, true);
      },
      storage: diskStorage({
        destination: './data/temp',
        filename: (_, file, cb) => {
          const decodedName = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );
          const filename = `${Date.now()}-${decodedName}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [FileController],
  providers: [FileUploadService, FileService],
})
export class FileModule {}
