import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { ConfigService } from '@config';
import { DrizzleDb, InjectDrizzle } from '@database';

import { File, FileEntity } from './schema/file.schema';

@Injectable()
export class FileService {
  private readonly logger = new Logger('FileService');

  constructor(
    private readonly config: ConfigService,
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  async getFiles(): Promise<FileEntity[]> {
    return await this.db.query.File.findMany({
      with: {
        status: true,
      },
    });
  }

  async getFile(id: string): Promise<FileEntity> {
    const file = await this.db.query.File.findFirst({
      where: eq(File.id, id),
      with: {
        status: true,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async deleteFile(id: string): Promise<void> {
    await this.db.delete(File).where(eq(File.id, id));
  }
}
