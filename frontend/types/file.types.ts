export interface FileDto {
    id: string;
    originalname: string;
    mimetype: string;
    filename: string;
    size: number;
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
