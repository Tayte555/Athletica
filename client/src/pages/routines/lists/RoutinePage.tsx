import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/UI/Navbar";
import Footer from "../../../components/UI/Footer";
import ErrorModal from "../../../components/UI/ErrorModal";
import { apiDelete, apiGet, apiPost } from "../../../lib/routineApi";
import type { Routine } from "../../../types/routine";
import {
  Star,
  Plus,
  Bookmark,
  FolderOpen,
  Compass,
  ArrowRight,
  Users,
} from "lucide-react";

export default function RoutinePage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [followingRoutines, setFollowingRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(true);

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
    const fetchRoutines = async () => {
      try {
        setLoading(true);

        const data = await apiGet<Routine[]>("/api/routines/public");
        setRoutines(data);
      } catch (err) {
        showError(
          err instanceof Error ? err.message : "Failed to load routines",
          "Routine Error",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  useEffect(() => {
    const fetchFollowingRoutines = async () => {
      try {
        setFollowingLoading(true);

        const data = await apiGet<Routine[]>(
          "/api/routines/recommended?context=routines&limit=3",
        );

        setFollowingRoutines(data);
      } catch (err) {
        showError(
          err instanceof Error
            ? err.message
            : "Failed to load suggested routines",
          "Suggested Routine Error",
        );
      } finally {
        setFollowingLoading(false);
      }
    };

    fetchFollowingRoutines();
  }, []);

  const visiblePublicRoutines = routines.slice(0, 3);

  const toggleSave = async (routine: Routine) => {
    try {
      const updated = routine.isSaved
        ? await apiDelete<Routine>(`/api/routines/${routine._id}/save`)
        : await apiPost<Routine>(`/api/routines/${routine._id}/save`);

      setRoutines((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );

      setFollowingRoutines((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update save state",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#111]">
      <Navbar />

      <main className="min-h-screen mx-auto w-full max-w-[1440px] px-6 pb-28 pt-10 md:px-10 lg:px-16">
        <section className="mb-10">
          <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#777]">
            Athletica
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Routines
          </h1>

          <p className="mt-3 max-w-2xl text-base text-[#555]">
            Create, save and explore workout routines from the community.
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
              Build a brand new workout routine.
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
              View and manage your created routines.
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
              Revisit routines you have saved.
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
              Explore public routines from other users.
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

        <section className="mb-12">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
              <Users size={20} />
            </div>

            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#777]">
                Suggested routines
              </p>

              <h2 className="text-2xl font-bold md:text-4xl">
                From people you follow
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-[#666]">
                Recently created public routines from accounts you follow.
              </p>
            </div>
          </div>

          {followingLoading ? (
            <p className="text-sm text-[#666]">Loading suggested routines...</p>
          ) : followingRoutines.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-black/10 bg-white p-6 text-sm text-[#666]">
              No followed-user routines to show yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {followingRoutines.map((routine) => (
                <div
                  key={routine._id}
                  className="overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-[220px] w-full overflow-hidden bg-[#ececec]">
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
            </div>
          )}
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
        </section>

        {loading ? (
          <p>Loading routines...</p>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visiblePublicRoutines.map((routine) => (
              <div
                key={routine._id}
                className="overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-[220px] w-full overflow-hidden bg-[#ececec]">
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

            {visiblePublicRoutines.length === 0 && (
              <p className="text-sm text-[#666]">No routines found.</p>
            )}
          </section>
        )}
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
