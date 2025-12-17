import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var __globalPrisma: PrismaClient | undefined
}

const prisma = global.__globalPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.__globalPrisma = prisma

export default prisma
