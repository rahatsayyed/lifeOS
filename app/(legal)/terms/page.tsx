export const metadata = {
  title: 'Terms of Service — Life OS',
}

export default function TermsPage() {
  return (
    <article className="prose prose-sm max-w-none dark:prose-invert space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. Acceptance</h2>
        <p>
          By using Life OS (&quot;the App&quot;), you agree to these Terms of Service.
          If you do not agree, please do not use the App.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. Use of the App</h2>
        <p>Life OS is a personal productivity tool. You agree to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the App only for lawful personal purposes</li>
          <li>Not attempt to reverse engineer, hack, or disrupt the App</li>
          <li>Not use the App to store or share illegal content</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. Your Data</h2>
        <p>
          You own all the data you enter into the App — habits, goals, tasks, recipes,
          and reminders. We do not claim any rights to your content.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. Account</h2>
        <p>
          You are responsible for keeping your account credentials secure. You are
          responsible for all activity that occurs under your account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. Service Availability</h2>
        <p>
          We provide the App on a best-effort basis. We do not guarantee uninterrupted
          availability and may modify or discontinue features at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. Disclaimer of Warranties</h2>
        <p>
          The App is provided &quot;as is&quot; without any warranties, express or implied.
          We are not liable for any loss of data or damages arising from your use of the App.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we shall not be liable for any indirect,
          incidental, or consequential damages arising out of your use of the App.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">8. Changes</h2>
        <p>
          We may update these Terms from time to time. Continued use of the App after
          changes means you accept the updated Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">9. Contact</h2>
        <p>
          Questions?{' '}
          <a href="mailto:rahat@daxa.ai" className="underline">rahat@daxa.ai</a>
        </p>
      </section>
    </article>
  )
}
