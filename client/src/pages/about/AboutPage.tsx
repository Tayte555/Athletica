import Navbar from "../../components/UI/Navbar";
import Footer from "../../components/UI/Footer";
import { Dumbbell, HeartHandshake, Search, TrendingUp } from "lucide-react";

const values = [
  {
    title: "Personal",
    description: "Users can create routines that suit their own goals.",
    icon: Dumbbell,
  },
  {
    title: "Social",
    description: "Public routines and profiles make fitness more connected.",
    icon: HeartHandshake,
  },
  {
    title: "Discoverable",
    description: "Users can find plans without endlessly searching online.",
    icon: Search,
  },
  {
    title: "Progressive",
    description: "Routine optimisation helps training improve over time.",
    icon: TrendingUp,
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-14 md:grid-cols-2 md:items-center md:px-10 lg:px-12">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-gray-600">
              About Athletica
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
              Fitness planning should feel simple.
            </h1>

            <div className="mt-8 space-y-5 text-base leading-8 text-gray-600 md:text-lg">
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
                The goal is to help users spend less time searching for the
                right plan and more time progressing with one.
              </p>
            </div>
          </div>

          <div className="relative md:justify-self-end">
            <div className="absolute -inset-4 rounded-[2rem] bg-gray-100" />

            <img
              src="/assets/tk-vb.jpg"
              alt="Athlete training"
              className="relative h-[420px] w-full rounded-[2rem] object-cover shadow-sm md:h-[560px] md:w-[430px]"
            />

            <div className="absolute -bottom-6 left-6 max-w-xs rounded-2xl bg-white p-5 shadow-md">
              <p className="text-sm font-medium text-gray-500">
                Built around one idea
              </p>
              <p className="mt-1 text-xl font-bold">
                Make training easier to plan and stick to.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-8 md:px-10 lg:px-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">What Athletica focuses on</h2>
            <p className="mt-2 text-gray-500">
              The app combines routine creation, discovery and social features
              into one fitness-focused platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                    <Icon size={23} />
                  </div>

                  <h3 className="text-lg font-bold">{value.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
