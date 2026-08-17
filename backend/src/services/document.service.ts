import type { DocumentCategory } from '@prisma/client'
import { documentModel } from '../models/document.model.js'
import { staffModel } from '../models/staff.model.js'
import { AppError } from '../utils/errors.js'

type CreateDocumentInput = {
  staffId?: string
  category: DocumentCategory
  title: string
  fileName: string
  fileUrl: string
  mimeType: string
}

export const documentService = {
  async list(category?: DocumentCategory, staffId?: string) {
    return documentModel.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(staffId ? { staffId } : {}),
      },
    })
  },

  async create(input: CreateDocumentInput) {
    if (input.staffId) {
      const staff = await staffModel.findById(input.staffId)
      if (!staff) {
        throw new AppError(404, 'Staff record not found')
      }
    }

    return documentModel.create({
      title: input.title,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      mimeType: input.mimeType,
      category: input.category,
      ...(input.staffId ? { staff: { connect: { id: input.staffId } } } : {}),
    })
  },

  async remove(id: string) {
    const document = await documentModel.findById(id)
    if (!document) {
      throw new AppError(404, 'Document not found')
    }
    await documentModel.softDelete(id)
  },
}
