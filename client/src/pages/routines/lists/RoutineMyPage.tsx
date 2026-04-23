import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/UI/Navbar";
import Footer from "../../../components/UI/Footer";
import { apiDelete, apiGet } from "../../../lib/routineApi";
import type { Routine } from "../../../types/routine";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

export default function RoutineMyPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyRoutines = async () => {
      try {
        setLoading(true);
        const data = await apiGet<Routine[]>("/api/routines/mine");
        setRoutines(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load routines",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyRoutines();
  }, []);

  const filtered = useMemo(() => {
    return routines.filter((routine) => {
      const value = search.toLowerCase();
      return (
        routine.title.toLowerCase().includes(value) ||
        routine.description.toLowerCase().includes(value) ||
        routine.tags?.some((tag) => tag.toLowerCase().includes(value))
      );
    });
  }, [routines, search]);

  const handleDelete = async (id: string) => {
    try {
      await apiDelete<{ message: string }>(`/api/routines/${id}`);
      setRoutines((prev) => prev.filter((routine) => routine._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete routine");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#111]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-6 pb-28 pt-10 md:px-10 lg:px-16">
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#777]">
              Creator space
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              My Routines
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[#555]">
              View and manage the routines you have created.
            </p>
          </div>

          <Link
            to="/routines/create"
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus size={16} />
            Create Routine
          </Link>
        </section>

        <section className="mb-8">
          <div className="relative max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777]"
            />
            <input
              type="text"
              placeholder="Search your routines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black/20"
            />
          </div>
        </section>

        {loading ? (
          <p>Loading your routines...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <section className="grid gap-6">
            {filtered.map((routine) => (
              <div
                key={routine._id}
                className="grid gap-5 rounded-[24px] border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[220px_1fr_auto]"
              >
                <div className="h-[150px] overflow-hidden rounded-2xl bg-[#ececec]">
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

                <div>
                  <h2 className="text-2xl font-semibold">{routine.title}</h2>
                  <p className="mt-2 text-sm text-[#666]">
                    {routine.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
                      {routine.difficulty}
                    </span>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
                      {routine.durationMinutes} min
                    </span>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
                      {routine.exercises.length} exercises
                    </span>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
                      {routine.isPublic ? "Public" : "Private"}
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
                    View
                  </Link>
                  <Link
                    to={`/routines/${routine._id}/edit`}
                    className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-black/5"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(routine._id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-sm text-[#666]">No routines found.</p>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
