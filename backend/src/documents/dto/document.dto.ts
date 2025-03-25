import { FileDto } from '@file/dto/file.dto';

export interface DocumentDto {
  id: string;
  file: FileDto;
  status: DocumentStatusDto[];
  attachments: FileDto[];
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentStatusStep {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface DocumentStatusDto {
  step: DocumentStatusStep;
  startedAt: Date | null;
  completedAt: Date | null;
  failed: boolean;
}
