import { AbstractFileProviderService, MedusaError } from '@medusajs/framework/utils';
import { Logger } from '@medusajs/framework/types';
import {
  ProviderUploadFileDTO,
  ProviderDeleteFileDTO,
  ProviderFileResultDTO,
  ProviderGetFileDTO,
  ProviderGetPresignedUploadUrlDTO
} from '@medusajs/framework/types';
import { Client } from 'minio';
import path from 'path';
import { ulid } from 'ulid';
import { Readable } from 'stream';

type InjectedDependencies = {
  logger: Logger
}

interface MinioServiceConfig {
  endPoint: string
  port: number
  useSSL: boolean
  accessKey: string
  secretKey: string
  bucket?: string
  publicUrl?: string
}

export interface MinioFileProviderOptions {
  endPoint: string
  port?: number | string
  useSSL?: boolean
  accessKey: string
  secretKey: string
  bucket?: string
  publicUrl?: string  // Optional: Use a different URL for public file access
}

const DEFAULT_BUCKET = 'medusa-media'

/**
 * Service to handle file storage using MinIO.
 */
class MinioFileProviderService extends AbstractFileProviderService {
  static identifier = 'minio-file'
  protected readonly config_: MinioServiceConfig
  protected readonly logger_: Logger
  protected client: Client
  protected readonly bucket: string
  protected readonly useSSL: boolean
  protected readonly publicUrl: string | null

  private parseConnectionOptions(options: MinioFileProviderOptions): {
    endPoint: string
    port: number
    useSSL: boolean
  } {
    const rawEndpoint = options.endPoint.trim()

    if (!rawEndpoint) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'MinIO endpoint cannot be empty')
    }

    const hasProtocol = /^https?:\/\//i.test(rawEndpoint)
    const normalizedEndpoint = hasProtocol ? rawEndpoint : `https://${rawEndpoint}`
    const parsed = new URL(normalizedEndpoint)

    const portFromUrl = parsed.port ? parseInt(parsed.port, 10) : undefined
    const portFromOptions =
      options.port === undefined || options.port === null || options.port === ''
        ? undefined
        : Number(options.port)

    const inferredUseSSL = hasProtocol ? parsed.protocol === 'https:' : true

    const useSSL = options.useSSL ?? inferredUseSSL

    const fallbackPort = useSSL ? 443 : 9000
    const port = Number.isFinite(portFromOptions)
      ? portFromOptions!
      : Number.isFinite(portFromUrl)
        ? portFromUrl!
        : fallbackPort

    return {
      endPoint: parsed.hostname,
      port,
      useSSL,
    }
  }

  private getErrorDetails(error: unknown): string {
    if (error instanceof Error) {
      const details = [error.name, error.message, error.stack].filter(Boolean).join(' | ')
      return details || 'Unknown Error'
    }

    if (typeof error === 'string') {
      return error
    }

    try {
      return JSON.stringify(error)
    } catch {
      return String(error)
    }
  }

  constructor({ logger }: InjectedDependencies, options: MinioFileProviderOptions) {
    super()
    this.logger_ = logger
    const { endPoint, port, useSSL } = this.parseConnectionOptions(options)
    
    this.config_ = {
      endPoint: endPoint,
      port,
      useSSL,
      accessKey: options.accessKey,
      secretKey: options.secretKey,
      bucket: options.bucket,
      publicUrl: options.publicUrl
    }

    // Use provided bucket or default
    this.bucket = this.config_.bucket || DEFAULT_BUCKET
    this.useSSL = this.config_.useSSL
    
    // Parse public URL if provided (for custom CDN or public-facing URL)
    this.publicUrl = options.publicUrl ? options.publicUrl.replace(/\/$/, '') : null
    
    this.logger_.info(`MinIO service initialized with bucket: ${this.bucket}, endpoint: ${endPoint}, port: ${port}, SSL: ${useSSL}${this.publicUrl ? `, publicUrl: ${this.publicUrl}` : ''}`)

    // Initialize Minio client with parsed settings
    this.client = new Client({
      endPoint: this.config_.endPoint,
      port: this.config_.port,
      useSSL: this.config_.useSSL,
      accessKey: this.config_.accessKey,
      secretKey: this.config_.secretKey
    })

    // Initialize bucket and policy
    this.initializeBucket().catch(error => {
      const errorDetails = this.getErrorDetails(error)
      this.logger_.error(`Failed to initialize MinIO bucket "${this.bucket}": ${errorDetails}`)
    })
  }

  static validateOptions(options: Record<string, any>) {
    const requiredFields = [
      'endPoint',
      'accessKey',
      'secretKey'
    ]

    requiredFields.forEach((field) => {
      if (!options[field]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${field} is required in the provider's options`
        )
      }
    })
  }

  private async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const bucketExists = await this.client.bucketExists(this.bucket)
      
      if (!bucketExists) {
        // Create the bucket
        await this.client.makeBucket(this.bucket)
        this.logger_.info(`Created bucket: ${this.bucket}`)

        // Set bucket policy to allow public read access
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicRead',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`]
            }
          ]
        }

        await this.client.setBucketPolicy(this.bucket, JSON.stringify(policy))
        this.logger_.info(`Set public read policy for bucket: ${this.bucket}`)
      } else {
        this.logger_.info(`Using existing bucket: ${this.bucket}`)
        
        // Verify/update policy on existing bucket
        try {
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'PublicRead',
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${this.bucket}/*`]
              }
            ]
          }
          await this.client.setBucketPolicy(this.bucket, JSON.stringify(policy))
          this.logger_.info(`Updated public read policy for existing bucket: ${this.bucket}`)
        } catch (policyError) {
          const policyErrorDetails = this.getErrorDetails(policyError)
          this.logger_.warn(`Failed to update policy for existing bucket "${this.bucket}": ${policyErrorDetails}`)
        }
      }
    } catch (error) {
      const errorDetails = this.getErrorDetails(error)
      this.logger_.error(`Error initializing bucket "${this.bucket}": ${errorDetails}`)
      throw error
    }
  }

  async upload(
    file: ProviderUploadFileDTO
  ): Promise<ProviderFileResultDTO> {
    if (!file) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'No file provided'
      )
    }

    if (!file.filename) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'No filename provided'
      )
    }

    try {
      const parsedFilename = path.parse(file.filename)
      const fileKey = `${parsedFilename.name}-${ulid()}${parsedFilename.ext}`
      
      // Handle different content types properly
      let content: Buffer
      if (Buffer.isBuffer(file.content)) {
        content = file.content
      } else if (typeof file.content === 'string') {
        // Medusa uploads are typically binary strings. Only decode as base64
        // when the payload is an explicit data URL to avoid corrupting files.
        const dataUrlMatch = file.content.match(/^data:(.+);base64,(.+)$/)

        if (dataUrlMatch) {
          content = Buffer.from(dataUrlMatch[2], 'base64')
        } else {
          content = Buffer.from(file.content, 'binary')
        }
      } else {
        // Handle ArrayBuffer, Uint8Array, or any other buffer-like type
        content = Buffer.from(file.content as any)
      }

      // Upload file with public-read access
      await this.client.putObject(
        this.bucket,
        fileKey,
        content,
        content.length,
        {
          'Content-Type': file.mimeType,
          'x-amz-meta-original-filename': file.filename,
          'x-amz-acl': 'public-read'
        }
      )

      // Generate URL using publicUrl if set, otherwise use endpoint
      let url: string
      if (this.publicUrl) {
        url = `${this.publicUrl}/${this.bucket}/${fileKey}`
      } else {
        const protocol = this.useSSL ? 'https' : 'http'
        url = `${protocol}://${this.config_.endPoint}/${this.bucket}/${fileKey}`
      }

      this.logger_.info(`Successfully uploaded file ${fileKey} to MinIO bucket ${this.bucket}, URL: ${url}`)

      return {
        url,
        key: fileKey
      }
    } catch (error) {
      this.logger_.error(`Failed to upload file: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to upload file: ${error.message}`
      )
    }
  }

  async delete(
    fileData: ProviderDeleteFileDTO | ProviderDeleteFileDTO[]
  ): Promise<void> {
    const files = Array.isArray(fileData) ? fileData : [fileData];

    for (const file of files) {
      if (!file?.fileKey) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          'No file key provided'
        );
      }

      try {
        await this.client.removeObject(this.bucket, file.fileKey);
        this.logger_.info(`Successfully deleted file ${file.fileKey} from MinIO bucket ${this.bucket}`);
      } catch (error) {
        this.logger_.warn(`Failed to delete file ${file.fileKey}: ${error.message}`);
      }
    }
  }

  async getPresignedDownloadUrl(
    fileData: ProviderGetFileDTO
  ): Promise<string> {
    if (!fileData?.fileKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'No file key provided'
      )
    }

    try {
      const url = await this.client.presignedGetObject(
        this.bucket,
        fileData.fileKey,
        24 * 60 * 60 // URL expires in 24 hours
      )
      this.logger_.info(`Generated presigned URL for file ${fileData.fileKey}`)
      return url
    } catch (error) {
      this.logger_.error(`Failed to generate presigned URL: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate presigned URL: ${error.message}`
      )
    }
  }

  async getPresignedUploadUrl(
    fileData: ProviderGetPresignedUploadUrlDTO
  ): Promise<ProviderFileResultDTO> {
    if (!fileData?.filename) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'No filename provided'
      )
    }

    try {
      // Use the filename directly as the key (matches S3 provider behavior for presigned uploads)
      const fileKey = fileData.filename

      // Generate presigned PUT URL that expires in 15 minutes
      const url = await this.client.presignedPutObject(
        this.bucket,
        fileKey,
        15 * 60 // URL expires in 15 minutes
      )

      return {
        url,
        key: fileKey
      }
    } catch (error) {
      this.logger_.error(`Failed to generate presigned upload URL: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate presigned upload URL: ${error.message}`
      )
    }
  }

  async getAsBuffer(fileData: ProviderGetFileDTO): Promise<Buffer> {
    if (!fileData?.fileKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'No file key provided'
      )
    }

    try {
      const stream = await this.client.getObject(this.bucket, fileData.fileKey)
      const buffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = []

        stream.on('data', (chunk: Buffer) => chunks.push(chunk))
        stream.on('end', () => resolve(Buffer.concat(chunks)))
        stream.on('error', reject)
      })

      this.logger_.info(`Retrieved buffer for file ${fileData.fileKey}`)
      return buffer
    } catch (error) {
      this.logger_.error(`Failed to get buffer: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to get buffer: ${error.message}`
      )
    }
  }

  async getDownloadStream(fileData: ProviderGetFileDTO): Promise<Readable> {
    if (!fileData?.fileKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'No file key provided'
      )
    }

    try {
      // Get the MinIO stream directly
      const minioStream = await this.client.getObject(this.bucket, fileData.fileKey)

      this.logger_.info(`Retrieved download stream for file ${fileData.fileKey}`)
      return minioStream
    } catch (error) {
      this.logger_.error(`Failed to get download stream: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to get download stream: ${error.message}`
      )
    }
  }
}

export default MinioFileProviderService
