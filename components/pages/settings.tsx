'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Lock, Moon, Settings as SettingsIcon, Sun, Type, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/ui/field-label'
import { toast, toastError } from '@/components/ui/toast'
import { StaffAvatar } from '@/components/staff/staff-avatar'
import { authApi, settingsApi, uploadFileToS3 } from '@/lib/api'
import { fontSizeOptions } from '@/lib/appearance'
import { useAppearance } from '@/lib/appearance-context'
import { useAuth } from '@/lib/auth-context'
import { useStaff } from '@/lib/staff-context'

export function Settings() {
  const { refresh, dataVersion } = useStaff()
  const { user, updateUser } = useAuth()
  const { theme, fontSize, setTheme, setFontSize } = useAppearance()
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [organizationName, setOrganizationName] = useState('')
  const [defaultExportFormat, setDefaultExportFormat] = useState<'CSV' | 'XLSX'>('XLSX')
  const [workspaceSaving, setWorkspaceSaving] = useState(false)

  const [name, setName] = useState(user?.name ?? '')
  const [photo, setPhoto] = useState(user?.photo ?? undefined)
  const [photoFile, setPhotoFile] = useState<File | undefined>(undefined)
  const [photoPreview, setPhotoPreview] = useState(user?.photo ?? undefined)
  const [profileSaving, setProfileSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    settingsApi.get().then((settings) => {
      setOrganizationName(settings.organizationName)
      setDefaultExportFormat(settings.defaultExportFormat === 'CSV' ? 'CSV' : 'XLSX')
    }).catch(() => undefined)
  }, [dataVersion])

  useEffect(() => {
    setName(user?.name ?? '')
    setPhoto(user?.photo ?? undefined)
    if (!photoFile) setPhotoPreview(user?.photo ?? undefined)
  }, [photoFile, user])

  function handlePhotoChange(file: File | undefined) {
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (event) => setPhotoPreview(typeof event.target?.result === 'string' ? event.target.result : undefined)
    reader.readAsDataURL(file)
  }

  async function handleSaveProfile() {
    setProfileSaving(true)
    try {
      const nextPhoto = photoFile
        ? await uploadFileToS3(photoFile, {
            kind: 'photo',
            fileName: photoFile.name,
            mimeType: photoFile.type || 'image/jpeg',
          })
        : photo
      const updated = await authApi.updateProfile({
        name: name.trim(),
        photo: nextPhoto || null,
      })
      updateUser(updated)
      setPhoto(updated.photo ?? undefined)
      setPhotoFile(undefined)
      setPhotoPreview(updated.photo ?? undefined)
      toast.add({ type: 'success', title: 'Profile saved.' })
    } catch (error) {
      toastError(error, 'Could not save your profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toastError(new Error('New passwords do not match.'), 'New passwords do not match.')
      return
    }
    setPasswordSaving(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.add({ type: 'success', title: 'Password updated.' })
    } catch (error) {
      toastError(error, 'Could not change your password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleSaveWorkspace() {
    setWorkspaceSaving(true)
    try {
      await settingsApi.update({ organizationName, defaultExportFormat })
      await refresh()
      toast.add({ type: 'success', title: 'Workspace settings saved.' })
    } catch (error) {
      toastError(error, 'Could not save settings.')
    } finally {
      setWorkspaceSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Account and workspace</p>
        <h2 className="text-3xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">Update your admin profile, password, and how the dashboard looks.</p>
      </div>

      <section className="max-w-3xl rounded-xl border bg-card">
        <div className="flex items-center gap-3 border-b p-5">
          <UserRound className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold">Admin profile</h3>
            <p className="text-xs text-muted-foreground">Your name and photo appear in the header.</p>
          </div>
        </div>
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <StaffAvatar name={name || 'Admin'} photo={photoPreview} className="size-16 text-lg" />
              <button type="button" aria-label="Upload profile photo" onClick={() => photoInputRef.current?.click()} className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                <Camera className="size-3.5" />
              </button>
              <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handlePhotoChange(event.target.files?.[0])} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Profile photo</p>
              {photoPreview ? (
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(undefined)
                    setPhotoFile(undefined)
                    setPhotoPreview(undefined)
                  }}
                  className="w-fit text-xs font-semibold text-destructive"
                >
                  Remove photo
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP.</p>
              )}
            </div>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <FieldLabel required>Display name</FieldLabel>
            <input required value={name} onChange={(event) => setName(event.target.value)} className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <Button className="w-fit" onClick={handleSaveProfile} disabled={profileSaving || !name.trim()}>
            {profileSaving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </section>

      <section className="max-w-3xl rounded-xl border bg-card">
        <div className="flex items-center gap-3 border-b p-5">
          <Lock className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold">Password</h3>
            <p className="text-xs text-muted-foreground">Change the password you use to sign in.</p>
          </div>
        </div>
        <div className="flex flex-col gap-5 p-5">
          <label className="flex flex-col gap-2 text-sm font-medium">
            <FieldLabel required>Current password</FieldLabel>
            <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <FieldLabel required>New password</FieldLabel>
            <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <FieldLabel required>Confirm new password</FieldLabel>
            <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <Button className="w-fit" onClick={handleChangePassword} disabled={passwordSaving || currentPassword.length < 1 || newPassword.length < 8}>
            {passwordSaving ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </section>

      <section className="max-w-3xl rounded-xl border bg-card">
        <div className="flex items-center gap-3 border-b p-5">
          <Type className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold">Appearance</h3>
            <p className="text-xs text-muted-foreground">Dark mode and dashboard text size apply immediately.</p>
          </div>
        </div>
        <div className="flex flex-col gap-6 p-5">
          <div>
            <p className="mb-3 text-sm font-medium">Theme</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setTheme('light').catch((error: unknown) => toastError(error, 'Could not save theme.'))} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left ${theme === 'light' ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                <Sun className="size-4 text-primary" />
                <span>
                  <span className="block text-sm font-medium">Light</span>
                  <span className="block text-xs text-muted-foreground">Bright workspace</span>
                </span>
              </button>
              <button type="button" onClick={() => setTheme('dark').catch((error: unknown) => toastError(error, 'Could not save theme.'))} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left ${theme === 'dark' ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                <Moon className="size-4 text-primary" />
                <span>
                  <span className="block text-sm font-medium">Dark</span>
                  <span className="block text-xs text-muted-foreground">Low-light workspace</span>
                </span>
              </button>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Dashboard font size</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFontSize(option.value).catch((error: unknown) => toastError(error, 'Could not save font size.'))}
                  className={`rounded-lg border px-4 py-3 text-left ${fontSize === option.value ? 'border-primary ring-2 ring-primary/20' : ''}`}
                >
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">{option.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl rounded-xl border bg-card">
        <div className="flex items-center gap-3 border-b p-5">
          <SettingsIcon className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold">Workspace</h3>
            <p className="text-xs text-muted-foreground">These preferences apply to this workspace.</p>
          </div>
        </div>
        <div className="flex flex-col gap-5 p-5">
          <label className="flex flex-col gap-2 text-sm font-medium">
            <FieldLabel required>Organization name</FieldLabel>
            <input required value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <FieldLabel required>Default export format</FieldLabel>
            <select value={defaultExportFormat} onChange={(event) => setDefaultExportFormat(event.target.value === 'CSV' ? 'CSV' : 'XLSX')} className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary">
              <option>CSV</option>
              <option>XLSX</option>
            </select>
          </label>
          <Button className="w-fit" onClick={handleSaveWorkspace} disabled={workspaceSaving}>
            {workspaceSaving ? 'Saving…' : 'Save workspace'}
          </Button>
        </div>
      </section>
    </div>
  )
}
