// client/src/pages/landing/LandingPage.tsx
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/UI/Navbar";
import Footer from "../../components/UI/Footer";

const levelCards = [
  {
    title: "Beginner",
    description: "New to the fitness scene and ready to take on a new chapter",
    image: "/assets/running.jpeg",
  },
  {
    title: "Intermediate",
    description: "Comfortable fitness enthusiasts looking to maintain or grow",
    image: "/assets/fitness.jpeg",
  },
  {
    title: "Athlete",
    description:
      "Existing athletes ready to take their skills to the next level",
    image: "/assets/basketball-player.jpg",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:px-10 lg:px-12">
        <section className="max-w-3xl py-8 md:py-14">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Shape your fitness journey.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
            With Athletica you create your own path in the fitness world.
            Create, discover and optimise your routine to ensure you’re always
            on track.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="mt-8 rounded-lg bg-black px-8 py-4 text-lg font-semibold text-white transition hover:bg-gray-800"
          >
            Start Now
          </button>
        </section>

        <img
          src="/assets/bench-press.jpeg"
          alt="Person bench pressing"
          className="h-[280px] w-full object-cover md:h-[430px]"
        />

        <section className="py-14 md:py-16">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Routines for all levels
          </h2>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {levelCards.map((card) => (
              <article key={card.title}>
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-72 w-full rounded-lg object-cover"
                />
                <h3 className="mt-6 text-xl font-bold">{card.title}</h3>
                <p className="mt-2 text-lg leading-7 text-gray-500">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
