import type { DocumentCategory } from '@prisma/client'
import type { Request, Response } from 'express'
import { documentService } from '../services/document.service.js'

type CreateDocumentBody = {
  staffId?: string
  category: DocumentCategory
  title: string
  fileName: string
  fileUrl: string
  mimeType: string
}

export const documentController = {
  async list(req: Request, res: Response) {
    const { category, staffId } = req.query as {
      category?: DocumentCategory
      staffId?: string
    }
    const documents = await documentService.list(category, staffId)
    res.status(200).json({ data: documents })
  },

  async create(req: Request, res: Response) {
    const document = await documentService.create(req.body as CreateDocumentBody)
    res.status(201).json({ data: document })
  },

  async remove(req: Request, res: Response) {
    await documentService.remove(String(req.params.id))
    res.status(204).send()
  },
}
