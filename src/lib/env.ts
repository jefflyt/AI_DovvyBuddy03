import { z } from 'zod'

/**
 * Environment variable schema validation.
 * 
 * Required variables:
 * - DATABASE_URL: PostgreSQL connection string (e.g., postgresql://user:pass@host:5432/db)
 * - GROQ_API_KEY: GROQ API key for LLM inference and embeddings (will evaluate other models after testing)
 * - GOOGLE_AI_API_KEY: Google AI API key for Gemini model (chat orchestration via Google ADK)
 * - BREVO_API_KEY: Brevo API key for email delivery (lead capture)
 * - NEXT_PUBLIC_APP_URL: Public-facing app URL (e.g., http://localhost:3000 or https://app.com)
 * - SESSION_SECRET: Secret key for session encryption (min 32 chars recommended)
 */
const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  GOOGLE_AI_API_KEY: z.string().min(1),
  BREVO_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
})

export type Env = z.infer<typeof EnvSchema>

/**
 * Load and validate environment variables on module initialization.
 * Throws a descriptive error if required variables are missing or invalid.
 * This ensures the app fails fast at startup rather than at runtime.
 */
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

/**
 * Validated environment variables.
 * Imported in root layout to guarantee validation runs at app startup.
 */
export const env = loadEnv()
