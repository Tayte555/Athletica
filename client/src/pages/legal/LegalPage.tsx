import Navbar from "../../components/UI/Navbar";
import Footer from "../../components/UI/Footer";

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="min-h-screen mx-auto w-full max-w-4xl flex-1 px-6 pt-12">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-bold">Legal Notice</h1>

          <p className="mt-4 text-gray-600">
            This page explains basic legal information about Athletica.
          </p>

          <div className="mt-8 space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold">Application Purpose</h2>
              <p className="mt-2">
                Athletica is a student project created as part of a final year
                computer science project. It is intended for educational and
                demonstration purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">No Medical Advice</h2>
              <p className="mt-2">
                Workout routines and recommendations shown in Athletica should
                not be treated as professional medical, fitness or physiotherapy
                advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Data Responsibility</h2>
              <p className="mt-2">
                Athletica aims to avoid collecting sensitive health data.
                Account information and user-created content are used only to
                support the features of the application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Content Moderation</h2>
              <p className="mt-2">
                Public routines, comments and profiles may be moderated to keep
                the platform safe and appropriate for users.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
