import Footer from "../../components/UI/Footer";
import Navbar from "../../components/UI/Navbar";
import ErrorModal from "../../components/UI/ErrorModal";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiDelete, apiGet, apiPost } from "../../lib/routineApi";
import type { Routine } from "../../types/routine";
import { Star, TrendingUp } from "lucide-react";

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
    setErrorModal({
      isOpen: true,
      title,
      message,
    });
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
    <div className="bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10 min-h-screen">
        <section className="mb-10">
          <h1 className="text-5xl font-bold md:text-6xl">
            Hi {username || "Athlete"}!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Welcome back to Athletica.
          </p>
        </section>

        <section className="mb-12 rounded-3xl bg-white p-6 shadow-sm">
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
              className="text-sm font-medium text-black underline-offset-4 hover:underline"
            >
              View routines
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
                <div
                  key={routine._id}
                  className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
                >
                  <div className="h-44 w-full overflow-hidden bg-gray-100">
                    {routine.image ? (
                      <img
                        src={`http://localhost:5555${routine.image}`}
                        alt={routine.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        No cover image
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="text-xl font-semibold leading-tight">
                        {routine.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        by{" "}
                        {routine.createdBy?.name || routine.createdBy?.username}
                      </p>
                    </div>

                    <p className="line-clamp-2 text-sm text-gray-600">
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

                    <div className="flex items-center gap-3">
                      <Link
                        to={`/routines/${routine._id}`}
                        className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
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

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star size={15} fill="currentColor" />
                      <span>{routine.savedByCount || 0} saves</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold">Quick Actions</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Link to="/routines/create">
              <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 h-24 rounded-xl bg-gray-100"></div>
                <h3 className="font-semibold">Create Routine</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Build a new workout routine.
                </p>
              </div>
            </Link>

            <Link to="/routines/my-routines">
              <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 h-24 rounded-xl bg-gray-100"></div>
                <h3 className="font-semibold">My Routines</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage the routines you have created.
                </p>
              </div>
            </Link>

            <Link to="/routines/saved">
              <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 h-24 rounded-xl bg-gray-100"></div>
                <h3 className="font-semibold">Saved Routines</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Go back to routines you have saved.
                </p>
              </div>
            </Link>
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
