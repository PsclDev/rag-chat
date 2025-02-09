export const useFileIcon = (mimetype: string) => {
    switch (mimetype) {
        case "application/pdf":
            return "i-heroicons-document-text";
        case "image/jpeg":
        case "image/png":
        case "image/gif":
            return "i-heroicons-photo";
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        case "application/vnd.ms-excel":
            return "i-heroicons-table-cells";
        default:
            return "i-heroicons-document";
    }
}