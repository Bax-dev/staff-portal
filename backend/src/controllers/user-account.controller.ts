import type { Request, Response } from 'express'
import type { PermissionEntry } from '../models/user-permission.model.js'
import { buildCredentialsPdf, buildCredentialsXlsx } from '../services/credentials-export.service.js'
import { userAccountService } from '../services/user-account.service.js'

type ExportFormat = 'xlsx' | 'pdf'

function parseExportFormat(value: unknown): ExportFormat | undefined {
  return value === 'xlsx' || value === 'pdf' ? value : undefined
}

function filenameFor(email: string, extension: string) {
  const local = email.split('@')[0] ?? email
  const safe = local.replace(/[^a-zA-Z0-9_-]/g, '_') || 'credentials'
  return `credentials-${safe}.${extension}`
}

async function sendCredentials(
  res: Response,
  format: ExportFormat,
  credentials: { name: string; email: string; password: string },
) {
  if (format === 'xlsx') {
    const buffer = await buildCredentialsXlsx(credentials)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${filenameFor(credentials.email, 'xlsx')}"`)
    res.send(buffer)
    return
  }

  const buffer = await buildCredentialsPdf(credentials)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filenameFor(credentials.email, 'pdf')}"`)
  res.send(buffer)
}

export const userAccountController = {
  async list(_req: Request, res: Response) {
    const accounts = await userAccountService.list()
    res.status(200).json({ data: accounts })
  },

  async getById(req: Request, res: Response) {
    const account = await userAccountService.getById(String(req.params.id))
    res.status(200).json({ data: account })
  },

  async create(req: Request, res: Response) {
    const body = req.body as { staffId: string; email: string; password?: string }
    const { account, plainPassword } = await userAccountService.create(body)

    const format = parseExportFormat(req.query.export)
    if (format) {
      await sendCredentials(res, format, { name: account.name, email: account.email, password: plainPassword })
      return
    }

    // NOTE: the frontend's primary create flow should always request a
    // format (?export=xlsx|pdf) so the plaintext password only ever leaves
    // the server inside a downloaded file. Returning it in the JSON body too
    // is a fallback path so the plaintext is still retrievable when no
    // export format was requested — never log it or persist it elsewhere.
    res.status(201).json({ data: { ...account, plainPassword } })
  },

  async updatePermissions(req: Request, res: Response) {
    const { permissions } = req.body as { permissions: PermissionEntry[] }
    const account = await userAccountService.updatePermissions(String(req.params.id), permissions)
    res.status(200).json({ data: account })
  },

  async resetPassword(req: Request, res: Response) {
    const { password } = req.body as { password?: string }
    const { account, plainPassword } = await userAccountService.resetPassword(String(req.params.id), password)

    const format = parseExportFormat(req.query.export)
    if (format) {
      await sendCredentials(res, format, { name: account.name, email: account.email, password: plainPassword })
      return
    }

    // See NOTE in create() above: same fallback/exposure-minimization reasoning applies here.
    res.status(200).json({ data: { ...account, plainPassword } })
  },

  async deactivate(req: Request, res: Response) {
    const account = await userAccountService.deactivate(String(req.params.id))
    res.status(200).json({ data: account })
  },

  async reactivate(req: Request, res: Response) {
    const account = await userAccountService.reactivate(String(req.params.id))
    res.status(200).json({ data: account })
  },

  async remove(req: Request, res: Response) {
    await userAccountService.remove(String(req.params.id))
    res.status(204).send()
  },
}
