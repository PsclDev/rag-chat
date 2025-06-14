export interface FileDto {
    id: string;
    originalname: string;
    mimetype: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
}


export interface RejectedFileDto {
    file: Omit<FileDto, 'createdAt' | 'updatedAt'>;
    reason: string;
}

export interface FileUploadResultDto {
    validFiles: FileDto[];
    rejectedFiles: RejectedFileDto[];
}
