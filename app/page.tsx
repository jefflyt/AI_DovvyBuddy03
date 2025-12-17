import React from 'react'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
      <section className="max-w-3xl mx-auto text-center px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">DovvyBuddy</h1>
        <p className="text-lg text-slate-600 mb-8">AI Diving Assistant — Starter app (V1)</p>
        <div className="inline-flex gap-3">
          <a href="#" className="px-5 py-3 bg-sky-600 text-white rounded-md shadow hover:bg-sky-500">Get Started</a>
          <a href="/api/health" className="px-5 py-3 border border-slate-200 rounded-md text-slate-700 bg-white">Health</a>
        </div>
      </section>
    </main>
  )
}
