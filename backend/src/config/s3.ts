import { S3Client } from '@aws-sdk/client-s3'
import { env } from './env.js'

export function assertS3Configured() {
  if (!env.s3.bucket || !env.s3.accessKeyId || !env.s3.secretAccessKey) {
    throw new Error('S3 is not configured. Set S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.')
  }
}

export const s3Client = new S3Client({
  region: env.s3.region,
  credentials: {
    accessKeyId: env.s3.accessKeyId,
    secretAccessKey: env.s3.secretAccessKey,
  },
  ...(env.s3.endpoint ? { endpoint: env.s3.endpoint } : {}),
  forcePathStyle: env.s3.forcePathStyle,
})
