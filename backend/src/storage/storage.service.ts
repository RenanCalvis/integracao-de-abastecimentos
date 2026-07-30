import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Minio.Client;
  private readonly BUCKET_NAME = 'receipts';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'minio');
    const port = Number(this.configService.get<number>('MINIO_PORT', 9000));
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }


  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.BUCKET_NAME);
      if (!exists) {
        await this.minioClient.makeBucket(this.BUCKET_NAME, 'us-east-1');
        this.logger.log(`Bucket '${this.BUCKET_NAME}' criado com sucesso no MinIO.`);

        // Configura política de leitura publica
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.BUCKET_NAME}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.BUCKET_NAME, JSON.stringify(policy));
      }
    } catch (error) {
      this.logger.error(`Erro ao verificar/criar bucket '${this.BUCKET_NAME}': ${(error as Error).message}`);
    }
  }

  async uploadReceipt(
    filename: string,
    buffer: Buffer,
    contentType: string = 'application/pdf',
  ): Promise<string> {
    await this.ensureBucketExists();

    await this.minioClient.putObject(
      this.BUCKET_NAME,
      filename,
      buffer,
      buffer.length,
      { 'Content-Type': contentType },
    );

    const publicUrl = this.configService.get<string>(
      'MINIO_PUBLIC_URL',
      'http://localhost:3103',
    );

    return `${publicUrl}/${this.BUCKET_NAME}/${filename}`;
  }
}
