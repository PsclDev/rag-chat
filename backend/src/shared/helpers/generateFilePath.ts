export function generateFilePath(
  basePath: string,
  fileId: string,
  extension: string,
  fileName?: string,
): string {
  return `${basePath}/${fileId}/${fileName ?? 'file'}.${extension}`;
}
