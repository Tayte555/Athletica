// client/src/pages/about/AboutPage.tsx
import Navbar from "../../components/UI/Navbar";
import Footer from "../../components/UI/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-white text-black">
      <Navbar />

      <main className="min-h-screen mx-auto grid w-full max-w-6xl flex-1 px-6 md:grid-cols-2 md:items-center md:px-10 lg:px-12">
        <section className="max-w-xl">
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
            About
          </h1>

          <p className="mt-8 text-xl text-gray-500">
            What is Athletica all about?
          </p>

          <div className="mt-8 space-y-5 text-base font-medium leading-7 text-gray-900 md:text-lg">
            <p>
              Athletica is a social fitness platform built to make workout
              planning clearer, more personal and easier to stay consistent
              with.
            </p>

            <p>
              Users can create routines, discover public plans, save workouts,
              follow other users and optimise their own training over time.
            </p>

            <p>
              The goal is to help users spend less time searching for the right
              plan and more time progressing with one.
            </p>
          </div>
        </section>

        <section className="md:justify-self-end">
          <img
            src="/assets/tk-vb.jpg"
            alt="Athlete training"
            className="h-[420px] w-full rounded-lg object-cover md:h-[540px] md:w-[420px] image-render-auto"
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
