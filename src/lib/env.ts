import { z } from 'zod'

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  GOOGLE_AI_API_KEY: z.string().min(1),
  SENDGRID_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
})

export type Env = z.infer<typeof EnvSchema>

function loadEnv(): Env {
  try {
    return EnvSchema.parse(process.env)
  } catch (err) {
    // Provide a helpful error message and rethrow
    if (err instanceof z.ZodError) {
      const missing = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n')
      throw new Error(`Environment validation error:\n${missing}`)
    }
    throw err
  }
}

export const env = loadEnv()
