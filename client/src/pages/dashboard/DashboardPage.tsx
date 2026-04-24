import Footer from "../../components/UI/Footer";
import Navbar from "../../components/UI/Navbar";
import ErrorModal from "../../components/UI/ErrorModal";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiDelete, apiGet, apiPost } from "../../lib/routineApi";
import type { Routine } from "../../types/routine";
import {
  Bookmark,
  Dumbbell,
  FolderOpen,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

const quickActions = [
  {
    title: "Create Routine",
    description: "Build a new workout routine from scratch.",
    to: "/routines/create",
    icon: Plus,
  },
  {
    title: "My Routines",
    description: "Manage the routines you have created.",
    to: "/routines/my-routines",
    icon: FolderOpen,
  },
  {
    title: "Saved Routines",
    description: "Return to routines you have saved.",
    to: "/routines/saved",
    icon: Bookmark,
  },
];

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [recommendedRoutines, setRecommendedRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "Something went wrong",
    message: "",
  });

  const showError = (message: string, title = "Something went wrong") => {
    setErrorModal({ isOpen: true, title, message });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          showError("Failed to load your profile details", "Profile Error");
          return;
        }

        const data = await res.json();
        setUsername(data.username || "");
      } catch (err) {
        showError(
          err instanceof Error ? err.message : "Failed to fetch profile",
          "Profile Error",
        );
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchRecommendedRoutines = async () => {
      try {
        setLoading(true);
        const data = await apiGet<Routine[]>(
          "/api/routines/recommended?context=dashboard&limit=4",
        );
        setRecommendedRoutines(data);
      } catch (err) {
        showError(
          err instanceof Error
            ? err.message
            : "Failed to load recommended routines",
          "Recommendation Error",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedRoutines();
  }, []);

  const toggleSave = async (routine: Routine) => {
    try {
      const updated = routine.isSaved
        ? await apiDelete<Routine>(`/api/routines/${routine._id}/save`)
        : await apiPost<Routine>(`/api/routines/${routine._id}/save`);

      setRecommendedRoutines((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update save state",
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <section className="mb-10 overflow-hidden rounded-3xl bg-gray-800 p-8 text-white shadow-sm md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                <Sparkles size={16} />
                Your training hub
              </div>

              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Hi {username || "Athlete"}!
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                Create routines, discover new workouts and keep track of the
                plans that help you progress.
              </p>
            </div>

            <Link
              to="/routines/create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              <Plus size={18} />
              Create routine
            </Link>
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                <TrendingUp size={16} />
                <span>Recommended routines</span>
              </div>

              <h2 className="text-2xl font-bold md:text-3xl">
                Popular right now
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                A few public routines that are currently performing well.
              </p>
            </div>

            <Link
              to="/routines"
              className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-600">Loading recommendations...</p>
          ) : recommendedRoutines.length === 0 ? (
            <p className="text-sm text-gray-600">
              No recommended routines available yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {recommendedRoutines.map((routine) => (
                <article
                  key={routine._id}
                  className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-44 w-full overflow-hidden bg-gray-100">
                    {routine.image ? (
                      <img
                        src={`http://localhost:5555${routine.image}`}
                        alt={routine.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Dumbbell className="text-gray-300" size={42} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="line-clamp-1 text-xl font-semibold">
                        {routine.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        by{" "}
                        {routine.createdBy?.name ||
                          routine.createdBy?.username ||
                          "Unknown user"}
                      </p>
                    </div>

                    <p className="line-clamp-2 text-sm leading-6 text-gray-600">
                      {routine.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
                        {routine.difficulty}
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
                        {routine.durationMinutes} min
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <Link
                        to={`/routines/${routine._id}`}
                        className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => toggleSave(routine)}
                        className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-black/5"
                      >
                        {routine.isSaved ? "Saved" : "Save"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 border-t border-black/5 pt-3 text-sm text-gray-500">
                      <Star size={15} fill="currentColor" />
                      <span>{routine.savedByCount || 0} saves</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Quick Actions</h2>
              <p className="mt-1 text-sm text-gray-500">
                Jump straight into the most useful parts of Athletica.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link key={action.title} to={action.to}>
                  <div className="group rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white transition group-hover:scale-105">
                      <Icon size={26} />
                    </div>

                    <h3 className="text-lg font-bold">{action.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />

      <ErrorModal
        isOpen={errorModal.isOpen}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() =>
          setErrorModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />
    </div>
  );
}
