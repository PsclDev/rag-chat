export interface RejectedFileDto {
  file: Express.Multer.File;
  reason: string;
}

export interface FileUploadResultDto {
  validFiles: Express.Multer.File[];
  rejectedFiles: RejectedFileDto[];
}
