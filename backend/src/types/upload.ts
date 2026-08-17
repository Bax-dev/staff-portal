import type { DocumentCategory } from '@prisma/client'

export type UploadKind = 'photo' | 'document'

export type PresignUploadInput = {
  kind: UploadKind
  fileName: string
  mimeType: string
  staffId?: string
  category?: DocumentCategory
}

export type PresignUploadResult = {
  key: string
  uploadUrl: string
  method: 'PUT'
  headers: {
    'Content-Type': string
  }
  expiresInSeconds: number
  maxBytes: number
  objectUrl: string
}

export type PresignDownloadInput = {
  key: string
}

export type PresignDownloadResult = {
  key: string
  downloadUrl: string
  expiresInSeconds: number
}
