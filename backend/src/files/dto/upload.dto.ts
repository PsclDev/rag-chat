import { FileDto } from './file.dto';

export interface RejectedFileDto {
  file: Express.Multer.File;
  reason: string;
}

export interface FileUploadResultDto {
  validFiles: FileDto[];
  rejectedFiles: RejectedFileDto[];
}
