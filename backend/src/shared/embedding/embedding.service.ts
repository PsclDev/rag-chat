export interface ImageEmbeddingVo {
  fileId: string;
  mimeType: string;
  base64Image: string;
}

export interface EmbeddingResponse {
  object: 'list';
  data: { object: 'embedding'; embedding: number[]; index: number }[];
  model: string;
  usage: {
    total_tokens: number;
  };
}

export interface SimilarityResult {
  fileId: string;
  content: string;
  similarity: number;
}

export abstract class EmbeddingService {
  abstract createTextEmbeddings(
    fileId: string,
    content: string[],
    abortSignal: AbortSignal,
  ): Promise<void>;
  abstract createImageEmbeddings(
    fileId: string,
    images: ImageEmbeddingVo[],
    abortSignal: AbortSignal,
  ): Promise<void>;
  abstract deleteAllEmbeddings(fileId: string): Promise<void>;
  abstract findSimilarEmbeddings(
    query: string,
    limit?: number,
  ): Promise<SimilarityResult[]>;
}
