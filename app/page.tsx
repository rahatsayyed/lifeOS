import Link from 'next/link'

export const metadata = {
  title: 'Life OS — Track your habits, goals, and life in one place',
  description:
    'Life OS is a private, offline-first app for tracking daily habits, weekly goals, tasks, recipes, and reminders — shared with your household.',
}

const features = [
  {
    icon: '✓',
    title: 'Daily Habits',
    desc: 'Build streaks, track completions, and see your progress day by day.',
  },
  {
    icon: '★',
    title: 'Weekly Goals & Rewards',
    desc: 'Set weekly goals with point values. Unlock a personal reward when you hit your target.',
  },
  {
    icon: '□',
    title: 'Tasks',
    desc: 'Capture to-dos with priorities and due dates. Never forget what matters.',
  },
  {
    icon: '♨',
    title: 'Recipes',
    desc: 'Save your household recipes with ingredients. Filter by tag and mark favourites.',
  },
  {
    icon: '◷',
    title: 'Reminders',
    desc: 'Schedule one-off or recurring push notifications straight to your phone.',
  },
  {
    icon: '⇄',
    title: 'Household Sync',
    desc: 'Connect with a partner and see each other\'s progress in real time.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 max-w-3xl mx-auto w-full">
        <span className="font-bold text-lg tracking-tight">Life OS</span>
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center px-6 pt-16 pb-12 text-center">
        <div className="max-w-lg mx-auto space-y-6">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            Your habits, goals, and life —<br className="hidden sm:block" /> in one place.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Life OS is a private, offline-ready app for two. Track daily habits, crush weekly goals,
            manage tasks and recipes, and send yourself reminders — all synced with your household.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Get started free
          </Link>
        </div>

        {/* Features grid */}
        <div className="mt-20 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border/60 bg-card p-5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-primary text-base">{f.icon}</span>
                <h2 className="font-semibold text-sm">{f.title}</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Works offline badge */}
        <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Works offline · installable PWA
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-6 text-center text-xs text-muted-foreground space-x-4">
        <span>© {new Date().getFullYear()} Life OS</span>
        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        <a href="mailto:rahat@daxa.ai" className="hover:text-foreground transition-colors">Contact</a>
      </footer>
    </div>
  )
}
