import { ConfigService } from '@config';
import { DrizzleDb, InjectDrizzle } from '@database';
import { Injectable, Logger } from '@nestjs/common';

import { FileDto } from './dto/file.dto';
import { toDto } from './schema/file.schema';

@Injectable()
export class FileService {
  private readonly logger = new Logger('FileService');

  constructor(
    private readonly config: ConfigService,
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  async getFiles(): Promise<FileDto[]> {
    const files = await this.db.query.File.findMany();
    return files.map(toDto);
  }
}
