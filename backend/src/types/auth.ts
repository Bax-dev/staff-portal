export type FrontendRole = 'admin' | 'staff'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: FrontendRole
  staffId: string | null
}

export type LoginInput = {
  email: string
  password: string
  role: FrontendRole
  rememberMe?: boolean
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
