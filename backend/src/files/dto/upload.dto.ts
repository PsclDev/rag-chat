import { FileDto } from './file.dto';

export interface RejectedFileDto {
  file: FileDto;
  reason: string;
}

export interface FileUploadResultDto {
  validFiles: FileDto[];
  rejectedFiles: RejectedFileDto[];
}
