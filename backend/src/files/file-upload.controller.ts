import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { FileUploadResultDto } from './dto/upload.dto';
import { FileUploadService } from './file-upload.service';

@Controller('file')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<FileUploadResultDto> {
    const result = await this.fileUploadService.handleUpload(files);
    await new Promise((resolve) => setTimeout(resolve, 4000)); // Wait 4 seconds
    return result;
  }
}
