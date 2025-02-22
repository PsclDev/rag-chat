import { EmbeddingService, SimilarityResult } from './embedding.service';

export class SentenceTransformerAdapterService extends EmbeddingService {
  constructor() {
    super();
  }

  createEmbeddings(fileId: string, content: string[]) {
    return null;
  }

  deleteAllEmbeddings(fileId: string): Promise<void> {
    return Promise.resolve();
  }

  findSimilarEmbeddings(
    query: string,
    limit?: number,
  ): Promise<SimilarityResult[]> {
    return Promise.resolve([]);
  }
}
