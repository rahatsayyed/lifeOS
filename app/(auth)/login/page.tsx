import { LoginButton } from './LoginButton'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Life OS</h1>
          <p className="text-muted-foreground">
            Your habits, goals, and life — in one place.
          </p>
        </div>
        <LoginButton />
      </div>
    </main>
  )
}
