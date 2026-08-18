function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: required('DATABASE_URL', 'postgresql://smp:smp@localhost:5432/staff_portal?schema=public'),
  redisUrl: required('REDIS_URL', 'redis://localhost:6379'),
  jwtSecret: required('JWT_SECRET', 'dev-only-change-me'),
  otpPepper: required('OTP_PEPPER', 'dev-only-otp-pepper'),
  otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS ?? 300),
  otpLength: Number(process.env.OTP_LENGTH ?? 6),
  passwordResetTtlSeconds: Number(process.env.PASSWORD_RESET_TTL_SECONDS ?? 3600),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  s3: {
    region: process.env.AWS_REGION ?? 'eu-west-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    bucket: process.env.S3_BUCKET ?? '',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    presignExpiresSeconds: Number(process.env.S3_PRESIGN_EXPIRES_SECONDS ?? 300),
  },
}
