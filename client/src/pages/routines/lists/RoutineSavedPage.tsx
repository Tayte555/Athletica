import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/UI/Navbar";
import Footer from "../../../components/UI/Footer";
import ErrorModal from "../../../components/UI/ErrorModal";
import { apiDelete, apiGet } from "../../../lib/routineApi";
import type { Routine } from "../../../types/routine";
import {
  Bookmark,
  BookmarkCheck,
  Heart,
  MessageCircle,
  Search,
} from "lucide-react";

export default function RoutineSavedPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [search, setSearch] = useState("");
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
    const fetchSaved = async () => {
      try {
        setLoading(true);

        const data = await apiGet<Routine[]>("/api/routines/saved/list");
        setRoutines(data);
      } catch (err) {
        showError(
          err instanceof Error ? err.message : "Failed to load saved routines",
          "Saved Routine Error",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  const filtered = useMemo(() => {
    return routines.filter((routine) => {
      const value = search.toLowerCase();

      return (
        routine.title.toLowerCase().includes(value) ||
        routine.description.toLowerCase().includes(value) ||
        routine.createdBy?.username?.toLowerCase().includes(value)
      );
    });
  }, [routines, search]);

  const handleUnsave = async (id: string) => {
    try {
      await apiDelete<Routine>(`/api/routines/${id}/save`);
      setRoutines((prev) => prev.filter((routine) => routine._id !== id));
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to unsave routine",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#111]">
      <Navbar />

      <main className="min-h-screen mx-auto w-full max-w-[1440px] px-6 pb-28 pt-10 md:px-10 lg:px-16">
        <section className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#777]">
            Your collection
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Saved Routines
          </h1>

          <p className="mt-3 max-w-2xl text-base text-[#555]">
            Routines you have saved for later.
          </p>
        </section>

        <section className="mb-8">
          <div className="relative max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777]"
            />

            <input
              type="text"
              placeholder="Search saved routines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black/20"
            />
          </div>
        </section>

        {loading ? (
          <p>Loading saved routines...</p>
        ) : (
          <section className="grid gap-6">
            {filtered.map((routine) => (
              <div
                key={routine._id}
                className="grid gap-5 rounded-[24px] border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md md:grid-cols-[220px_1fr_auto] md:p-5"
              >
                <div className="h-[180px] overflow-hidden rounded-2xl bg-[#ececec] md:h-[140px]">
                  {routine.image ? (
                    <img
                      src={`http://localhost:5555${routine.image}`}
                      alt={routine.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#777]">
                      No cover image
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h2 className="text-2xl font-semibold">{routine.title}</h2>

                    <p className="mt-1 text-sm text-[#666]">
                      by{" "}
                      <Link
                        to={
                          routine.createdBy?.username
                            ? `/${routine.createdBy.username}`
                            : "#"
                        }
                        className="inline-block text-sm text-gray-500 transition hover:text-black"
                      >
                        {routine.createdBy?.name ||
                          routine.createdBy?.username ||
                          "Athletica user"}
                      </Link>
                    </p>
                  </div>

                  <p className="text-sm text-[#555]">{routine.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
                      {routine.difficulty}
                    </span>

                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
                      {routine.durationMinutes} min
                    </span>

                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
                      {routine.exercises.length} exercises
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      <Heart size={14} />
                      <span>{routine.likesCount || 0}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      <MessageCircle size={14} />
                      <span>{routine.commentsCount || 0}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      <Bookmark size={14} />
                      <span>{routine.savedByCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:items-end">
                  <Link
                    to={`/routines/${routine._id}`}
                    className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => handleUnsave(routine._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5"
                  >
                    <BookmarkCheck size={16} />
                    Saved
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-sm text-[#666]">No saved routines found.</p>
            )}
          </section>
        )}
      </main>

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
      <Footer />
    </div>
  );
}
