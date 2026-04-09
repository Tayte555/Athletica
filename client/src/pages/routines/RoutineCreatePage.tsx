import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/UI/Navbar";
import Footer from "../../components/UI/Footer";
import ExercisePickerModal from "../../components/routines/ExercisePickerModal";
import { apiPost } from "../../lib/routineApi";
import type { Exercise, Routine } from "../../types/routine";
import { Plus, Trash2, GripVertical } from "lucide-react";

type SelectedRoutineExercise = {
  exercise?: Exercise | null;
  customExercise?: {
    name: string;
    muscleGroup: string;
    equipment: string[];
    description: string;
    image?: string;
    instructions?: string[];
  } | null;
  order: number;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
};

export default function RoutineCreatePage() {
  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "Beginner",
    durationMinutes: 45,
    focus: "",
    workoutType: "",
    targetMuscles: "",
    equipment: "",
    tags: "",
    notes: "",
    image: "",
    isPublic: true,
  });

  const [exercises, setExercises] = useState<SelectedRoutineExercise[]>([]);

  const addExerciseToRoutine = (exerciseItem: SelectedRoutineExercise) => {
    setExercises((prev) => [
      ...prev,
      {
        ...exerciseItem,
        order: prev.length + 1,
      },
    ]);
  };

  const updateExercise = (
    index: number,
    field: keyof SelectedRoutineExercise,
    value: string | number | Exercise,
  ) => {
    setExercises((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeExercise = (index: number) => {
    setExercises((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, order: i + 1 })),
    );
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    setExercises((prev) => {
      const newItems = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newItems.length) return prev;

      [newItems[index], newItems[targetIndex]] = [
        newItems[targetIndex],
        newItems[index],
      ];

      return newItems.map((item, i) => ({
        ...item,
        order: i + 1,
      }));
    });
  };

  const totalExercises = useMemo(() => exercises.length, [exercises]);

  const handleSaveRoutine = async () => {
    try {
      setError("");

      if (!form.title.trim()) {
        setError("Routine title is required");
        return;
      }

      if (exercises.length === 0) {
        setError("Add at least one exercise");
        return;
      }

      setSaving(true);

      const payload = {
        ...form,
        exercises: exercises.map((item, index) => ({
          exercise: item.exercise?._id || null,
          customExercise: item.customExercise || null,
          order: index + 1,
          sets: Number(item.sets),
          reps: item.reps,
          restSeconds: Number(item.restSeconds),
          notes: item.notes,
        })),
      };

      const created = await apiPost<Routine>("/api/routines", payload);
      navigate(`/routines/${created._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save routine");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#111]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1400px] px-6 pt-10 pb-28 md:px-10 lg:px-16">
        <h1 className="mb-10 text-5xl font-bold tracking-tight md:text-6xl">
          Create Routine
        </h1>

        <section className="mb-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4 rounded-[28px] border border-black/10 bg-white p-6">
            <input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Routine title"
              className="w-full border-none p-0 text-3xl font-bold outline-none placeholder:text-[#777]"
            />

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              placeholder="Routine description"
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/20"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, difficulty: e.target.value }))
                }
                className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    durationMinutes: Number(e.target.value),
                  }))
                }
                placeholder="Duration (minutes)"
                className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
              />

              <input
                value={form.focus}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, focus: e.target.value }))
                }
                placeholder="Focus"
                className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
              />

              <input
                value={form.workoutType}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, workoutType: e.target.value }))
                }
                placeholder="Workout type"
                className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
              />

              <input
                value={form.targetMuscles}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    targetMuscles: e.target.value,
                  }))
                }
                placeholder="Target muscles (comma separated)"
                className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
              />

              <input
                value={form.equipment}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, equipment: e.target.value }))
                }
                placeholder="Equipment (comma separated)"
                className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
              />

              <input
                value={form.tags}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="Tags (comma separated)"
                className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
              />

              <input
                value={form.image}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, image: e.target.value }))
                }
                placeholder="Cover image URL"
                className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
              />
            </div>

            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={4}
              placeholder="Routine notes"
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/20"
            />

            <label className="inline-flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isPublic: e.target.checked }))
                }
              />
              Make routine public
            </label>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-black/10 bg-white p-6">
              <p className="text-sm text-[#666]">Exercises</p>
              <p className="mt-1 text-3xl font-bold">{totalExercises}</p>
            </div>

            <div className="rounded-[28px] border border-black/10 bg-white p-6">
              <button
                onClick={() => setShowPicker(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Plus size={16} />
                Add Exercise
              </button>

              <button
                onClick={handleSaveRoutine}
                disabled={saving}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-medium transition hover:bg-black/5 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Routine"}
              </button>

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </section>

        <section className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Exercises</h2>
            <p className="mt-1 text-sm text-[#666]">
              Add, reorder and customise your routine exercises.
            </p>
          </div>
        </section>

        <section className="grid gap-4">
          {exercises.map((item, index) => (
            <div
              key={`${item.exercise?._id}-${index}`}
              className="rounded-[24px] border border-black/10 bg-white p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-black/5 p-2">
                    <GripVertical size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {item.order}.{" "}
                      {item.exercise?.name ||
                        item.customExercise?.name ||
                        "Custom Exercise"}
                    </h3>
                    <p className="mt-1 text-sm text-[#666]">
                      {item.exercise?.muscleGroup ||
                        item.customExercise?.muscleGroup ||
                        "General"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => moveExercise(index, "up")}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
                  >
                    Up
                  </button>
                  <button
                    onClick={() => moveExercise(index, "down")}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
                  >
                    Down
                  </button>
                  <button
                    onClick={() => removeExercise(index)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <input
                  type="number"
                  value={item.sets}
                  onChange={(e) =>
                    updateExercise(index, "sets", Number(e.target.value))
                  }
                  placeholder="Sets"
                  className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
                />
                <input
                  value={item.reps}
                  onChange={(e) =>
                    updateExercise(index, "reps", e.target.value)
                  }
                  placeholder="Reps"
                  className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
                />
                <input
                  type="number"
                  value={item.restSeconds}
                  onChange={(e) =>
                    updateExercise(index, "restSeconds", Number(e.target.value))
                  }
                  placeholder="Rest seconds"
                  className="h-11 rounded-xl border border-black/10 px-4 text-sm outline-none"
                />
                <input
                  value={
                    item.exercise?.equipment?.join(", ") ||
                    item.customExercise?.equipment?.join(", ") ||
                    ""
                  }
                  disabled
                  placeholder="Equipment"
                  className="h-11 rounded-xl border border-black/10 bg-[#fafafa] px-4 text-sm outline-none"
                />
              </div>

              <textarea
                value={item.notes}
                onChange={(e) => updateExercise(index, "notes", e.target.value)}
                rows={3}
                placeholder="Exercise notes"
                className="mt-4 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/20"
              />
            </div>
          ))}

          {exercises.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-black/20 bg-white p-10 text-center text-[#666]">
              No exercises added yet.
            </div>
          )}
        </section>
      </main>

      <Footer />

      <ExercisePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onAddExercise={addExerciseToRoutine}
      />
    </div>
  );
}
