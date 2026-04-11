import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/UI/Navbar";
import Footer from "../../components/UI/Footer";
import { Link } from "react-router-dom";
import { apiGet } from "../../lib/routineApi";
import type { Routine } from "../../types/routine";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  MessageCircle,
  Bookmark,
} from "lucide-react";

type DiscoverResponse = {
  items: Routine[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
};

export default function DiscoverPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [difficulty, setDifficulty] = useState("");
  const [recency, setRecency] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [muscle, setMuscle] = useState("");
  const [duration, setDuration] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search so API is not hit on every keystroke instantly
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const fetchRoutines = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
        });

        if (debouncedSearch) params.set("q", debouncedSearch);
        if (difficulty) params.set("difficulty", difficulty);
        if (recency) params.set("recency", recency);
        if (workoutType) params.set("workoutType", workoutType);
        if (muscle) params.set("muscle", muscle);

        if (duration === "short") {
          params.set("minDuration", "0");
          params.set("maxDuration", "30");
        } else if (duration === "medium") {
          params.set("minDuration", "31");
          params.set("maxDuration", "60");
        } else if (duration === "long") {
          params.set("minDuration", "61");
        }

        const data = await apiGet<DiscoverResponse>(
          `/api/routines/search?${params.toString()}`,
        );

        setRoutines(data.items || []);
        setPagination(
          data.pagination || {
            page: 1,
            totalPages: 1,
            total: 0,
          },
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load routines.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, [
    debouncedSearch,
    difficulty,
    recency,
    workoutType,
    muscle,
    duration,
    page,
  ]);

  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; value: string }[] = [];

    if (difficulty) {
      filters.push({
        key: "difficulty",
        label: "Difficulty",
        value: difficulty,
      });
    }

    if (recency) {
      const recencyLabel =
        recency === "7d"
          ? "Last 7 days"
          : recency === "30d"
            ? "Last 30 days"
            : recency === "90d"
              ? "Last 90 days"
              : recency;

      filters.push({
        key: "recency",
        label: "Recency",
        value: recencyLabel,
      });
    }

    if (workoutType) {
      filters.push({
        key: "workoutType",
        label: "Type",
        value: workoutType,
      });
    }

    if (muscle) {
      filters.push({
        key: "muscle",
        label: "Muscle",
        value: muscle,
      });
    }

    if (duration) {
      const durationLabel =
        duration === "short"
          ? "0–30 mins"
          : duration === "medium"
            ? "31–60 mins"
            : "60+ mins";

      filters.push({
        key: "duration",
        label: "Duration",
        value: durationLabel,
      });
    }

    return filters;
  }, [difficulty, recency, workoutType, muscle, duration]);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setDifficulty("");
    setRecency("");
    setWorkoutType("");
    setMuscle("");
    setDuration("");
    setPage(1);
  };

  const removeFilter = (key: string) => {
    if (key === "difficulty") setDifficulty("");
    if (key === "recency") setRecency("");
    if (key === "workoutType") setWorkoutType("");
    if (key === "muscle") setMuscle("");
    if (key === "duration") setDuration("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#111]">
      <Navbar />

      {/* HERO */}
      <section className="relative h-[430px] w-full overflow-hidden">
        {/* <img
          src="/images/forest-run.jpg"
          alt="Discover workout plans"
          className="absolute inset-0 h-full w-full object-cover"
        /> */}

        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            What’s the plan?
          </h1>

          <p className="mt-4 text-lg text-white/90 md:text-xl">
            Search for a fitness plan that meets your needs
          </p>

          <div className="mt-7 w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search workout plans, goals, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 w-full rounded-xl border border-white/20 bg-white px-5 text-base text-black outline-none transition focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="px-6 py-10 md:px-12">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-6xl">
              Expand your search
            </h2>
            <p className="mt-2 text-sm text-gray-500 md:text-base">
              Narrow down community plans using filters that match your goals
            </p>
          </div>

          <button
            onClick={clearFilters}
            className="w-fit rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
          >
            Clear filters
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-2 block text-sm text-gray-600">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
            >
              <option value="">Any difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-600">Recency</label>
            <select
              value={recency}
              onChange={(e) => {
                setRecency(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
            >
              <option value="">Any time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-600">
              Workout type
            </label>
            <select
              value={workoutType}
              onChange={(e) => {
                setWorkoutType(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
            >
              <option value="">Any type</option>
              <option value="Strength">Strength</option>
              <option value="Hypertrophy">Hypertrophy</option>
              <option value="Cardio">Cardio</option>
              <option value="Rehab">Rehab</option>
              <option value="Mobility">Mobility</option>
              <option value="Athletic">Athletic</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-600">
              Target muscle
            </label>
            <select
              value={muscle}
              onChange={(e) => {
                setMuscle(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
            >
              <option value="">Any muscle group</option>
              <option value="Chest">Chest</option>
              <option value="Back">Back</option>
              <option value="Legs">Legs</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Arms">Arms</option>
              <option value="Core">Core</option>
              <option value="Glutes">Glutes</option>
              <option value="Full Body">Full Body</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-600">Duration</label>
            <select
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
            >
              <option value="">Any duration</option>
              <option value="short">0–30 mins</option>
              <option value="medium">31–60 mins</option>
              <option value="long">60+ mins</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(activeFilters.length > 0 || debouncedSearch) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {debouncedSearch && (
              <button
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white"
              >
                Search: {debouncedSearch}
                <X size={14} />
              </button>
            )}

            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => removeFilter(filter.key)}
                className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white"
              >
                {filter.label}: {filter.value}
                <X size={14} />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* RESULTS */}
      <section className="px-6 pb-16 md:px-12">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold md:text-4xl">Results</h3>
          {!loading && !error && (
            <p className="mt-2 text-sm text-gray-500">
              {pagination.total} result{pagination.total === 1 ? "" : "s"} found
            </p>
          )}
        </div>

        {error && (
          <p className="mb-6 text-center text-sm text-red-600">{error}</p>
        )}

        {loading ? (
          <div className="space-y-5">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse gap-6 rounded-xl border border-black/10 bg-white p-4"
              >
                <div className="h-24 w-24 rounded-lg bg-gray-200" />
                <div className="flex-1">
                  <div className="h-5 w-56 rounded bg-gray-200" />
                  <div className="mt-3 h-4 w-32 rounded bg-gray-200" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                </div>
                <div className="h-10 w-28 rounded-lg bg-gray-200" />
              </div>
            ))}
          </div>
        ) : routines.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white px-6 py-12 text-center shadow-sm">
            <h4 className="text-xl font-semibold">No routines found</h4>
            <p className="mt-2 text-sm text-gray-500">
              {debouncedSearch
                ? `No results found for "${debouncedSearch}". Try changing your filters or search term.`
                : "Try changing your filters to find more community workout plans."}
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Reset search
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {routines.map((routine) => (
                <div
                  key={routine._id}
                  className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md md:flex-row md:items-center md:gap-6"
                >
                  {/* IMAGE */}
                  <div className="h-24 w-full overflow-hidden rounded-lg bg-gray-200 md:w-24">
                    {routine.image ? (
                      <img
                        src={routine.image}
                        alt={routine.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-xl font-semibold leading-tight">
                          {routine.title}
                        </h4>

                        <Link
                          to={
                            routine.createdBy?.username
                              ? `/${routine.createdBy.username}`
                              : "#"
                          }
                          className="mt-1 inline-block text-sm text-gray-500 transition hover:text-black"
                        >
                          {routine.createdBy?.name ||
                            routine.createdBy?.username ||
                            "Athletica user"}
                        </Link>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                      {routine.difficulty && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1">
                          {routine.difficulty}
                        </span>
                      )}

                      {routine.durationMinutes && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1">
                          {routine.durationMinutes} mins
                        </span>
                      )}

                      {routine.workoutType && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1">
                          {routine.workoutType}
                        </span>
                      )}

                      {routine.focus && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1">
                          {routine.focus}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                      {routine.description
                        ? routine.description.length > 140
                          ? `${routine.description.slice(0, 140)}...`
                          : routine.description
                        : "No description provided."}
                    </p>

                    {routine.tags && routine.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {routine.tags.slice(0, 4).map((tag: string) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSearch(tag);
                              setDebouncedSearch(tag);
                              setPage(1);
                            }}
                            className="rounded-full bg-black/5 px-3 py-1 text-xs transition hover:bg-black hover:text-white"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ENGAGEMENT ROW */}
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

                  {/* ACTION */}
                  <div className="md:self-center">
                    <Link
                      to={`/routines/${routine._id}`}
                      className="inline-flex rounded-lg border border-black/15 px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm">
                Page {pagination.page} of {pagination.totalPages}
              </div>

              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                }
                disabled={page === pagination.totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
