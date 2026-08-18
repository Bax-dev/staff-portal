import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'node:crypto'
import { assertS3Configured, s3Client } from '../config/s3.js'
import { env } from '../config/env.js'
import type { PresignDownloadInput, PresignUploadInput, UploadKind } from '../types/upload.js'
import { AppError } from '../utils/errors.js'

const photoMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const documentMimeTypes = new Set([
  ...photoMimeTypes,
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

const maxBytesByKind: Record<UploadKind, number> = {
  photo: 5 * 1024 * 1024,
  document: 20 * 1024 * 1024,
}

const extensionByMime: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'text/csv': 'csv',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}

function allowedMimeTypes(kind: UploadKind) {
  return kind === 'photo' ? photoMimeTypes : documentMimeTypes
}

function fileExtension(fileName: string, mimeType: string) {
  const fromName = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (/^[a-z0-9]+$/.test(fromName) && fromName.length <= 8) {
    return fromName
  }
  return extensionByMime[mimeType] ?? 'bin'
}

function objectUrl(key: string) {
  if (env.s3.endpoint) {
    const base = env.s3.endpoint.replace(/\/$/, '')
    return env.s3.forcePathStyle ? `${base}/${env.s3.bucket}/${key}` : `${base}/${key}`
  }
  return `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${key}`
}

function buildObjectKey(input: PresignUploadInput) {
  const ext = fileExtension(input.fileName, input.mimeType)
  const id = randomUUID()

  if (input.kind === 'photo') {
    return input.staffId ? `photos/staff/${input.staffId}/${id}.${ext}` : `photos/users/${id}.${ext}`
  }

  const category = (input.category ?? 'STAFF_REGISTER').toLowerCase()
  return input.staffId
    ? `documents/${category}/${input.staffId}/${id}.${ext}`
    : `documents/${category}/${id}.${ext}`
}

function assertAllowedUpload(input: PresignUploadInput) {
  if (!allowedMimeTypes(input.kind).has(input.mimeType)) {
    throw new AppError(400, `Unsupported file type for ${input.kind} uploads: ${input.mimeType}`)
  }

  if (input.kind === 'document' && !input.category) {
    throw new AppError(400, 'Document uploads require a category')
  }
}

function ensureConfigured() {
  try {
    assertS3Configured()
  } catch (error) {
    throw new AppError(503, error instanceof Error ? error.message : 'S3 is not configured')
  }
}

export const s3Service = {
  async createUploadUrl(input: PresignUploadInput) {
    ensureConfigured()
    assertAllowedUpload(input)

    const key = buildObjectKey(input)
    const command = new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: key,
      ContentType: input.mimeType,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: env.s3.presignExpiresSeconds,
    })

    return {
      key,
      uploadUrl,
      method: 'PUT' as const,
      headers: { 'Content-Type': input.mimeType },
      expiresInSeconds: env.s3.presignExpiresSeconds,
      maxBytes: maxBytesByKind[input.kind],
      objectUrl: objectUrl(key),
    }
  },

  async createDownloadUrl({ key }: PresignDownloadInput) {
    ensureConfigured()

    if (!key.startsWith('photos/') && !key.startsWith('documents/')) {
      throw new AppError(400, 'Invalid object key')
    }

    const command = new GetObjectCommand({
      Bucket: env.s3.bucket,
      Key: key,
    })

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: env.s3.presignExpiresSeconds,
    })

    return {
      key,
      downloadUrl,
      expiresInSeconds: env.s3.presignExpiresSeconds,
    }
  },

  async deleteObject(key: string) {
    ensureConfigured()

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.s3.bucket,
        Key: key,
      }),
    )
  },
}
