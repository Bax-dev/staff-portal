export type FrontendRole = 'admin' | 'staff'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: FrontendRole
  staffId: string | null
  photo: string | null
  theme: AppearanceTheme
  fontSize: AppearanceFontSize
}

export type AppearanceTheme = 'light' | 'dark'

export type AppearanceFontSize = 'small' | 'medium' | 'large' | 'xlarge'

export type LoginInput = {
  email: string
  password: string
  role: FrontendRole
}

export type UpdateProfileInput = {
  name?: string
  photo?: string | null
  theme?: AppearanceTheme
  fontSize?: AppearanceFontSize
}

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
}

export type RequestOtpInput = {
  email: string
}

export type VerifyOtpInput = {
  email: string
  code: string
}

export type RequestPasswordResetInput = {
  email: string
}

export type ResetPasswordInput = {
  token: string
  password: string
}
