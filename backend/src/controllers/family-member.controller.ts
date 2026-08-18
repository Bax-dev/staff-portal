import type { Request, Response } from 'express'
import { familyMemberService } from '../services/family-member.service.js'
import type { CreateFamilyMemberInput, UpdateFamilyMemberInput } from '../types/staff-records.js'
import { paramId } from '../utils/params.js'

export const familyMemberController = {
  async list(req: Request, res: Response) {
    const records = await familyMemberService.list(paramId(req, 'staffId'))
    res.status(200).json({ data: records })
  },

  async create(req: Request, res: Response) {
    const record = await familyMemberService.create(paramId(req, 'staffId'), req.body as CreateFamilyMemberInput)
    res.status(201).json({ data: record })
  },

  async update(req: Request, res: Response) {
    const record = await familyMemberService.update(
      paramId(req, 'staffId'),
      paramId(req, 'id'),
      req.body as UpdateFamilyMemberInput,
    )
    res.status(200).json({ data: record })
  },

  async remove(req: Request, res: Response) {
    await familyMemberService.remove(paramId(req, 'staffId'), paramId(req, 'id'))
    res.status(204).send()
  },
}
