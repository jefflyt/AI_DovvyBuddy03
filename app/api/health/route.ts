import { NextResponse } from 'next/server'
import '@/lib/env'

export async function GET() {
  // Basic DB connectivity check (dynamically import Prisma to avoid requiring generated client at build-time)
  let dbStatus = 'unknown'

  try {
    const prismaMod = await import('@/lib/prisma')
    const prisma = prismaMod.default
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'ok'
  } catch (err) {
    dbStatus = 'error'
  }

  const checks = {
    env: 'ok',
    database: dbStatus,
  }

  if (dbStatus === 'ok') {
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString(), checks })
  }

  // Database not reachable — return 503 degraded status
  return NextResponse.json({ status: 'degraded', timestamp: new Date().toISOString(), checks }, { status: 503 })
}
