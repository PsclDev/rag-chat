export interface File {
    id: number;
    name: string;
    type: "pdf" | "image" | "spreadsheet" | "document";
    size: number;
    status: "pending" | "processing" | "completed" | "error";
    currentStep: number;
    createdAt: Date;
    lastModified: Date;
    mimeType: string;
    extension: string;
    pageCount?: number;
    priority: "low" | "medium" | "high";
    tags: string[];
    retryCount: number;
    errorMessage?: string;
}

export interface ProcessingStep {
    id: string;
    label: string;
}


export interface FileDto {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

export interface RejectedFileDto {
    file: FileDto;
    reason: string;
}