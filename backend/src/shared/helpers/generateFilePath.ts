export function generateFilePath(
  basePath: string,
  documentId: string,
  extension: string,
  fileName?: string,
): string {
  return `${basePath}/${documentId}/${fileName ?? 'file'}.${extension}`;
}
