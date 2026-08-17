'use client'

import { Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Settings() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Workspace configuration</p>
        <h2 className="text-3xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">Manage local dashboard preferences.</p>
      </div>
      <div className="max-w-3xl rounded-xl border bg-card">
        <div className="flex items-center gap-3 border-b p-5">
          <SettingsIcon className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold">General settings</h3>
            <p className="text-xs text-muted-foreground">These preferences apply to this workspace.</p>
          </div>
        </div>
        <div className="flex flex-col gap-5 p-5">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Organization name
            <input defaultValue="Planning and Design Directorate" className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Default export format
            <select defaultValue="XLSX" className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary">
              <option>CSV</option>
              <option>XLSX</option>
            </select>
          </label>
          <Button className="w-fit" onClick={() => window.alert('Settings saved for this workspace.')}>
            Save settings
          </Button>
        </div>
      </div>
    </div>
  )
}
