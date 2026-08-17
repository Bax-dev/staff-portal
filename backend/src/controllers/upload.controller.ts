import type { Request, Response } from 'express'
import { s3Service } from '../services/s3.service.js'
import type { PresignDownloadInput, PresignUploadInput } from '../types/upload.js'

export const uploadController = {
  async presignUpload(req: Request, res: Response) {
    const result = await s3Service.createUploadUrl(req.body as PresignUploadInput)
    res.status(200).json({ data: result })
  },

  async presignDownload(req: Request, res: Response) {
    const result = await s3Service.createDownloadUrl(req.body as PresignDownloadInput)
    res.status(200).json({ data: result })
  },
}
