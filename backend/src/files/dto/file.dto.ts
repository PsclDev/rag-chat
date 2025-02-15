import { FileStatusStep } from '@file/schema/file-status.schema';

export interface FileDto {
  id: string;
  originalname: string;
  mimetype: string;
  filename: string;
  size: number;
  status: FileStatusDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FileStatusDto {
  step: FileStatusStep;
  startedAt: Date | null;
  completedAt: Date | null;
  failed: boolean;
}
