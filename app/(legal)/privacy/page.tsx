export const metadata = {
  title: 'Privacy Policy — Life OS',
}

export default function PrivacyPage() {
  return (
    <article className="prose prose-sm max-w-none dark:prose-invert space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. What is Life OS?</h2>
        <p>
          Life OS is a personal productivity app for tracking habits, weekly goals, tasks,
          recipes, and reminders. It is designed for personal household use.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. Information We Collect</h2>
        <p>We collect only what you provide directly:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your name, email address, and profile photo from Google Sign-In</li>
          <li>Habits, goals, tasks, recipes, and reminders you create</li>
          <li>Push notification subscription tokens (for reminders)</li>
        </ul>
        <p>We do not collect usage analytics, advertising identifiers, or device fingerprints.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To provide and display your personal data within the app</li>
          <li>To send push notifications for reminders you set</li>
          <li>To sync data between connected household accounts</li>
        </ul>
        <p>We do not sell, share, or use your data for advertising.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. Data Storage</h2>
        <p>
          Your data is stored securely in Supabase (PostgreSQL), which is hosted on AWS
          infrastructure. Data is encrypted in transit (TLS) and at rest.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. Data Sharing</h2>
        <p>
          Your data is private by default. You may choose to share specific categories
          (habits, goals, tasks, recipes) with connected accounts — this sharing is
          controlled entirely by you and can be revoked at any time in Settings.
        </p>
        <p>We do not share your data with any third parties except Supabase (infrastructure).</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. Data Deletion</h2>
        <p>
          You can delete your account and all associated data at any time by contacting us
          at the email below. We will process deletion requests within 30 days.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">7. Children</h2>
        <p>
          Life OS is not directed at children under 13. We do not knowingly collect data
          from children under 13.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">8. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Changes will be posted on this page
          with an updated date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">9. Contact</h2>
        <p>
          Questions about this policy?{' '}
          <a href="mailto:rahat@daxa.ai" className="underline">rahat@daxa.ai</a>
        </p>
      </section>
    </article>
  )
}
