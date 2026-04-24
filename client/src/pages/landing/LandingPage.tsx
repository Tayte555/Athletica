import { useNavigate } from "react-router-dom";
import Navbar from "../../components/UI/Navbar";
import Footer from "../../components/UI/Footer";
import {
  Dumbbell,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const levelCards = [
  {
    title: "Beginner",
    description:
      "Simple routines to help you build confidence and consistency.",
    icon: Dumbbell,
  },
  {
    title: "Intermediate",
    description: "Structured plans for users ready to progress their training.",
    icon: TrendingUp,
  },
  {
    title: "Athlete",
    description: "Higher level routines built for performance and progression.",
    icon: Sparkles,
  },
];

const features = [
  {
    title: "Create",
    description: "Build your own workout routines around your goals.",
    icon: SlidersHorizontal,
  },
  {
    title: "Discover",
    description: "Explore public routines shared by other users.",
    icon: Search,
  },
  {
    title: "Connect",
    description: "Follow users, save routines and stay motivated.",
    icon: Users,
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center md:px-10 lg:px-12">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-gray-600">
              <Sparkles size={16} />
              Fitness planning made clearer
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
              Shape your fitness journey.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Create, discover and optimise workout routines that fit your own
              goals, experience level and training style.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/register")}
                className="rounded-2xl bg-black px-7 py-4 text-base font-semibold text-white transition hover:bg-gray-800"
              >
                Start Now
              </button>

              <button
                onClick={() => navigate("/about")}
                className="rounded-2xl border border-black/10 px-7 py-4 text-base font-semibold transition hover:bg-gray-50"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gray-100" />
            <img
              src="/assets/bench-press.jpeg"
              alt="Person bench pressing"
              className="relative h-[360px] w-full rounded-[2rem] object-cover shadow-sm md:h-[520px]"
            />

            <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 p-4 shadow-md backdrop-blur">
              <p className="text-sm font-medium text-gray-500">
                Routine building
              </p>
              <p className="text-2xl font-bold">Made simple</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 lg:px-12">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                    <Icon size={26} />
                  </div>

                  <h3 className="text-xl font-bold">{feature.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-14 md:px-10 lg:px-12">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Routines for all levels
            </h2>

            <p className="mt-4 text-gray-600">
              Whether you are just getting started or training seriously,
              Athletica helps you find a routine that feels right.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {levelCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="rounded-3xl bg-gray-50 p-8 transition hover:bg-gray-100"
                >
                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Icon size={30} />
                  </div>

                  <h3 className="text-2xl font-bold">{card.title}</h3>

                  <p className="mt-3 text-base leading-7 text-gray-500">
                    {card.description}
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
