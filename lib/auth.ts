export type Role = 'staff' | 'admin'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockLogin({ email, password }: { email: string; password: string; role: Role }) {
  await delay(700)
  if (!EMAIL_PATTERN.test(email)) throw new Error('Enter a valid work email address.')
  if (password.length < 6) throw new Error('Password must be at least 6 characters.')
}

export async function mockRequestPasswordReset({ email }: { email: string }) {
  await delay(700)
  if (!EMAIL_PATTERN.test(email)) throw new Error('Enter a valid work email address.')
  // Always resolves successfully — an unknown email must not be distinguishable from a known one.
}

export async function mockResetPassword({ token, password }: { token: string | null; password: string }) {
  await delay(700)
  if (!token) throw new Error('This reset link is invalid or has expired.')
  if (password.length < 8) throw new Error('Password must be at least 8 characters.')
}
