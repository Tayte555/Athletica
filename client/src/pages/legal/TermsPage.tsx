import Navbar from "../../components/UI/Navbar";
import Footer from "../../components/UI/Footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="min-h-screen mx-auto w-full max-w-4xl flex-1 px-6 pt-12">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-bold">Terms and Conditions</h1>

          <p className="mt-4 text-gray-600">
            These terms explain the basic rules for using Athletica.
          </p>

          <div className="mt-8 space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold">1. Use of Athletica</h2>
              <p className="mt-2">
                Athletica is designed to help users create, save, discover and
                share workout routines. Users should use the platform
                responsibly and must not misuse the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. User Accounts</h2>
              <p className="mt-2">
                Users are responsible for keeping their login details secure.
                Any activity carried out through an account is the
                responsibility of the account holder.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. User Content</h2>
              <p className="mt-2">
                Users may create routines, comments and profile content. Content
                should not be offensive, harmful, misleading or abusive.
                Athletica may hide or remove content that breaks these rules.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Fitness Disclaimer</h2>
              <p className="mt-2">
                Athletica does not provide medical advice. Users should exercise
                safely and seek professional guidance if they are unsure whether
                a routine is suitable for them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Changes to Terms</h2>
              <p className="mt-2">
                These terms may be updated as the application develops.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
