import '@/styles/globals.css'
import '@/lib/env'

export const metadata = {
  title: 'DovvyBuddy | AI Diving Assistant',
  description: 'Get expert scuba diving advice powered by AI. Explore dive sites, plan trips, and learn diving safety with DovvyBuddy.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
