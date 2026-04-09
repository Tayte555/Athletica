import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/UI/Navbar";
import Footer from "../../../components/UI/Footer";
import { apiDelete, apiGet, apiPost } from "../../../lib/routineApi";
import type { Routine } from "../../../types/routine";
import {
  Search,
  Star,
  Plus,
  Bookmark,
  FolderOpen,
  Compass,
  ArrowRight,
} from "lucide-react";

export default function RoutinePage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        setLoading(true);
        const data = await apiGet<Routine[]>("/api/routines/public");
        setRoutines(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load routines",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  const filteredRoutines = useMemo(() => {
    return routines.filter((routine) => {
      const value = search.toLowerCase();
      return (
        routine.title.toLowerCase().includes(value) ||
        routine.description.toLowerCase().includes(value) ||
        routine.tags?.some((tag) => tag.toLowerCase().includes(value)) ||
        routine.createdBy?.username?.toLowerCase().includes(value) ||
        routine.createdBy?.name?.toLowerCase().includes(value)
      );
    });
  }, [routines, search]);

  const toggleSave = async (routine: Routine) => {
    try {
      const updated = routine.isSaved
        ? await apiDelete<Routine>(`/api/routines/${routine._id}/save`)
        : await apiPost<Routine>(`/api/routines/${routine._id}/save`);

      setRoutines((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update save state",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#111]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-6 pb-28 pt-10 md:px-10 lg:px-16">
        <section className="mb-10">
          <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#777]">
            Athletica
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Routines
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#555]">
            Create your own routines, manage your workouts, save routines you
            like, and explore what the community has shared.
          </p>
        </section>

        <section className="mb-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Link
            to="/routines/create"
            className="group rounded-[26px] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
              <Plus size={22} />
            </div>
            <h2 className="text-2xl font-semibold">Create Routine</h2>
            <p className="mt-2 text-sm text-[#666]">
              Build a brand new workout routine with preset or custom exercises.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
              Go to creator
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            to="/routines/my-routines"
            className="group rounded-[26px] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
              <FolderOpen size={22} />
            </div>
            <h2 className="text-2xl font-semibold">My Routines</h2>
            <p className="mt-2 text-sm text-[#666]">
              View, manage and delete the routines you have created.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
              Open your routines
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            to="/routines/saved"
            className="group rounded-[26px] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
              <Bookmark size={22} />
            </div>
            <h2 className="text-2xl font-semibold">Saved Routines</h2>
            <p className="mt-2 text-sm text-[#666]">
              Revisit routines you have saved from the community.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
              View saved
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            to="/discover"
            className="group rounded-[26px] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
              <Compass size={22} />
            </div>
            <h2 className="text-2xl font-semibold">Discover</h2>
            <p className="mt-2 text-sm text-[#666]">
              Discover public routines shared by other users.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
              Browse community
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </Link>
        </section>

        <section className="mb-8 rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#777]">
                Quick actions
              </p>
              <h2 className="text-2xl font-bold md:text-3xl">
                Get started faster
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#666]">
                Jump straight into creating a routine, managing your own, or
                browsing community workout plans.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/routines/create"
                className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Create Routine
              </Link>
              <Link
                to="/routines/my-routines"
                className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/5"
              >
                My Routines
              </Link>
              <Link
                to="/routines/saved"
                className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/5"
              >
                Saved Routines
              </Link>
            </div>
          </div>
        </section>

        <section id="community-routines" className="mb-8">
          <div className="mb-5">
            <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#777]">
              Community
            </p>
            <h2 className="text-2xl font-bold md:text-4xl">
              Explore Public Routines
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#666]">
              Search through public routines created by other Athletica users.
            </p>
          </div>

          <div className="relative max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777]"
            />
            <input
              type="text"
              placeholder="Search routines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black/20"
            />
          </div>
        </section>

        {loading ? (
          <p>Loading routines...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRoutines.map((routine) => (
              <div
                key={routine._id}
                className="overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-[220px] w-full overflow-hidden bg-[#ececec]">
                  {routine.image ? (
                    <img
                      src={routine.image}
                      alt={routine.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#777]">
                      No cover image
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="text-2xl font-semibold leading-tight">
                      {routine.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#666]">
                      by{" "}
                      {routine.createdBy?.name || routine.createdBy?.username}
                    </p>
                  </div>

                  <p className="line-clamp-2 text-sm text-[#555]">
                    {routine.description}
                  </p>

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
                    {routine.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <Link
                      to={`/routines/${routine._id}`}
                      className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => toggleSave(routine)}
                      className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-black/5"
                    >
                      {routine.isSaved ? "Saved" : "Save"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#444]">
                    <Star size={15} fill="currentColor" />
                    <span>{routine.savedByCount || 0} saves</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredRoutines.length === 0 && (
              <p className="text-sm text-[#666]">No routines found.</p>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
