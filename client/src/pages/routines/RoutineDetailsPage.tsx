import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/UI/Navbar";
import Footer from "../../components/UI/Footer";
import { apiDelete, apiGet, apiPost } from "../../lib/routineApi";
import type { Routine } from "../../types/routine";

export default function RoutineDetailsPage() {
  const { id } = useParams();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiGet<Routine>(`/api/routines/${id}`);
        setRoutine(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load routine");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoutine();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!routine) return;

    try {
      setSaveLoading(true);

      const updated = routine.isSaved
        ? await apiDelete<Routine>(`/api/routines/${routine._id}/save`)
        : await apiPost<Routine>(`/api/routines/${routine._id}/save`);

      setRoutine(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update save state",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f6f6]">
        <Navbar />
        <main className="mx-auto max-w-[1200px] px-6 py-16">Loading...</main>
        <Footer />
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen bg-[#f6f6f6]">
        <Navbar />
        <main className="mx-auto max-w-[1200px] px-6 py-16 text-red-600">
          {error || "Routine not found"}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#111]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1300px] px-6 pt-10 pb-28 md:px-10 lg:px-16">
        <section className="mb-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-black/10 bg-white p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#777]">
              Routine
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {routine.title}
            </h1>

            <p className="mt-4 max-w-3xl text-base text-[#555]">
              {routine.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {routine.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-black/10 p-4">
                <p className="text-xs uppercase tracking-wide text-[#777]">
                  Difficulty
                </p>
                <p className="mt-1 font-semibold">{routine.difficulty}</p>
              </div>
              <div className="rounded-2xl border border-black/10 p-4">
                <p className="text-xs uppercase tracking-wide text-[#777]">
                  Duration
                </p>
                <p className="mt-1 font-semibold">
                  {routine.durationMinutes} min
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 p-4">
                <p className="text-xs uppercase tracking-wide text-[#777]">
                  Focus
                </p>
                <p className="mt-1 font-semibold">
                  {routine.focus || "Not specified"}
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 p-4">
                <p className="text-xs uppercase tracking-wide text-[#777]">
                  Workout Type
                </p>
                <p className="mt-1 font-semibold">
                  {routine.workoutType || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {routine.image ? (
              <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white">
                <img
                  src={routine.image}
                  alt={routine.title}
                  className="h-[260px] w-full object-cover"
                />
              </div>
            ) : null}

            <div className="rounded-[28px] border border-black/10 bg-white p-6">
              <p className="text-sm text-[#666]">Created by</p>
              <p className="mt-1 text-lg font-semibold">
                {routine.createdBy?.name ||
                  routine.createdBy?.username ||
                  "User"}
              </p>

              <p className="mt-4 text-sm text-[#666]">Saved by</p>
              <p className="mt-1 text-lg font-semibold">
                {routine.savedByCount || 0} users
              </p>

              {routine.isOwner && (
                <Link
                  to={`/routines/${routine._id}/edit`}
                  className="mt-3 block w-full rounded-xl border border-black/10 px-4 py-3 text-center text-sm font-medium transition hover:bg-black/5"
                >
                  Edit Routine
                </Link>
              )}

              <button
                onClick={handleSaveToggle}
                disabled={saveLoading}
                className="mt-5 w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {saveLoading
                  ? "Updating..."
                  : routine.isSaved
                    ? "Unsave Routine"
                    : "Save Routine"}
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-[#666]">Target Muscles</p>
            <p className="mt-2 text-sm font-medium">
              {routine.targetMuscles?.length
                ? routine.targetMuscles.join(", ")
                : "Not specified"}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-[#666]">Equipment</p>
            <p className="mt-2 text-sm font-medium">
              {routine.equipment?.length
                ? routine.equipment.join(", ")
                : "Not specified"}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-[#666]">Routine Notes</p>
            <p className="mt-2 text-sm font-medium">
              {routine.notes || "No notes added"}
            </p>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold md:text-3xl">Exercises</h2>
            <p className="mt-1 text-sm text-[#666]">
              Step-by-step breakdown of the routine.
            </p>
          </div>

          <div className="grid gap-4">
            {routine.exercises.map((item) => (
              <div
                key={`${item.exercise?._id}-${item.order}`}
                className="rounded-[24px] border border-black/10 bg-white p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {item.order}. {item.exerciseData?.name || "Exercise"}
                    </h3>
                    <p className="mt-1 text-sm text-[#666]">
                      {item.exerciseData?.muscleGroup || "General"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/5 px-3 py-1 text-sm">
                      {item.sets} sets
                    </span>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-sm">
                      {item.reps} reps
                    </span>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-sm">
                      {item.restSeconds}s rest
                    </span>
                  </div>
                </div>

                {item.exerciseData?.description && (
                  <p className="mt-4 text-sm text-[#555]">
                    {item.exerciseData.description}
                  </p>
                )}

                {item.notes && (
                  <div className="mt-4 rounded-2xl bg-black/5 px-4 py-3 text-sm text-[#444]">
                    {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
