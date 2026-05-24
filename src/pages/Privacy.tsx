export default function Privacy() {
  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-bold mb-12">Privacy Policy</h1>
        <div className="space-y-8 text-white/60 leading-relaxed">
          <p>Last updated: May 19, 2026</p>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Data Collection Compliance</h2>
            <p>
              Postatu complies with all data privacy regulations for the platforms we integrate with, including Meta (Facebook & Instagram), Google (YouTube), and TikTok. We only collect the data necessary to provide our distribution services.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. OAuth & Tokens</h2>
            <p>
              When you connect your social accounts, we receive access tokens via official OAuth flows. These tokens are securely encrypted and stored in our Supabase database. We never see or store your platform passwords.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Usage</h2>
            <p>
              We use your data strictly for publishing content at your direction. We do not sell user data or use it for advertising purposes.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. User Rights & Deletion</h2>
            <p>
              You have the right to access, modify, or delete your data at any time. To request full data deletion, please contact us at <strong>Kingmd892@gmail.com</strong>. Revoking access tokens via our dashboard immediately stops our ability to interact with your platform accounts.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
