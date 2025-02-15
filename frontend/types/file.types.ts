export interface FileStatusStep {
    status: 'queued' | 'processing' | 'completed';
    label: string;
}

export interface FileStatusDto {
    step: 'queued' | 'processing' | 'completed' | 'failed';
    startedAt: string | null;
    completedAt: string | null;
    failed: boolean;
}

export interface FileDto {
    id: string;
    originalname: string;
    mimetype: string;
    filename: string;
    size: number;
    status: FileStatusDto[];
    createdAt: string;
    updatedAt: string;
}

export interface RejectedFileDto {
    file: Omit<FileDto, 'createdAt' | 'updatedAt'>;
    reason: string;
}

export interface FileUploadResultDto {
    validFiles: FileDto[];
    rejectedFiles: RejectedFileDto[];
}
