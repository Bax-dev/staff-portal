import { settingsModel } from '../models/settings.model.js'

type UpdateSettingsInput = {
  organizationName?: string
  defaultExportFormat?: 'CSV' | 'XLSX'
}

export const settingsService = {
  async get() {
    const existing = await settingsModel.findFirst()
    if (existing) return existing

    return settingsModel.create({
      organizationName: 'Planning and Design Directorate',
      defaultExportFormat: 'XLSX',
    })
  },

  async update(input: UpdateSettingsInput) {
    const current = await this.get()
    return settingsModel.update(current.id, input)
  },
}
