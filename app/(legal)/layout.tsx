export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">
          ← Life OS
        </a>
        {children}
      </div>
    </main>
  )
}
