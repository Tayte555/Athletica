import { useEffect, useMemo, useState } from "react";
import { X, Dumbbell } from "lucide-react";
import { apiGet } from "../../lib/routineApi";
import type { Exercise, CustomExercise } from "../../types/routine";
import MultiSelectChips from "../../components/UI/MultiSelectChips";
import { EQUIPMENT_OPTIONS } from "../../constants/routineOptions";

type SelectedRoutineExercise = {
  exercise?: Exercise | null;
  customExercise?: CustomExercise | null;
  order: number;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAddExercise: (exercise: SelectedRoutineExercise) => void;
};

const blankCustomExercise = {
  name: "",
  muscleGroup: "",
  equipment: [] as string[],
  description: "",
  image: "",
  instructions: "",
};

export default function ExercisePickerModal({
  open,
  onClose,
  onAddExercise,
}: Props) {
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [customExercise, setCustomExercise] = useState(blankCustomExercise);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchLibrary = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiGet<Exercise[]>("/api/exercises/library");
        setLibrary(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load exercises",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [open]);

  const filtered = useMemo(() => {
    return library.filter((exercise) => {
      const value = search.toLowerCase();
      return (
        exercise.name.toLowerCase().includes(value) ||
        exercise.muscleGroup.toLowerCase().includes(value) ||
        exercise.equipment.some((item) => item.toLowerCase().includes(value))
      );
    });
  }, [library, search]);

  const addPresetExercise = (exercise: Exercise) => {
    onAddExercise({
      exercise,
      customExercise: null,
      order: 1,
      sets: 3,
      reps: "8-12",
      restSeconds: 60,
      notes: "",
    });
    onClose();
  };

  const addCustomExercise = () => {
    if (!customExercise.name.trim()) {
      setError("Exercise name is required");
      return;
    }

    setError("");

    onAddExercise({
      exercise: null,
      customExercise: {
        name: customExercise.name.trim(),
        muscleGroup: customExercise.muscleGroup.trim(),
        equipment: customExercise.equipment,
        description: customExercise.description.trim(),
        image: customExercise.image.trim(),
        instructions: customExercise.instructions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
      order: 1,
      sets: 3,
      reps: "8-12",
      restSeconds: 60,
      notes: "",
    });

    setCustomExercise(blankCustomExercise);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold">Add Exercise</h2>
            <p className="mt-1 text-sm text-[#666]">
              Pick from the default library or create a custom exercise for this
              routine only.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-black/5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-[1.35fr_0.9fr]">
          <div className="border-r border-black/10 p-6">
            <div className="mb-4 flex gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search default exercises..."
                className="h-11 flex-1 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-black/20"
              />
            </div>

            {loading ? (
              <p className="text-sm text-[#666]">Loading exercises...</p>
            ) : (
              <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
                {filtered.map((exercise) => (
                  <button
                    key={exercise._id}
                    onClick={() => addPresetExercise(exercise)}
                    className="rounded-2xl border border-black/10 p-4 text-left transition hover:bg-black/5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/5">
                        <Dumbbell size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold">
                            {exercise.name}
                          </h3>
                          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium text-[#555]">
                            Preset
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-[#666]">
                          {exercise.muscleGroup || "General"}
                        </p>

                        {exercise.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-[#555]">
                            {exercise.description}
                          </p>
                        )}

                        {exercise.equipment?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {exercise.equipment.map((item) => (
                              <span
                                key={item}
                                className="rounded-full bg-black/5 px-2.5 py-1 text-xs"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {!loading && filtered.length === 0 && (
                  <p className="text-sm text-[#666]">No exercises found.</p>
                )}
              </div>
            )}
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Create Custom Exercise</h3>
            <p className="mt-1 text-sm text-[#666]">
              This will only be stored inside the current routine.
            </p>

            <div className="mt-5 space-y-3">
              <input
                value={customExercise.name}
                onChange={(e) =>
                  setCustomExercise((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Exercise name"
                className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-black/20"
              />

              <input
                value={customExercise.muscleGroup}
                onChange={(e) =>
                  setCustomExercise((prev) => ({
                    ...prev,
                    muscleGroup: e.target.value,
                  }))
                }
                placeholder="Muscle group"
                className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-black/20"
              />

              <div className="md:col-span-2">
                <MultiSelectChips
                  label="Equipment needed"
                  options={EQUIPMENT_OPTIONS}
                  values={customExercise.equipment}
                  onChange={(values) =>
                    setCustomExercise((prev) => ({
                      ...prev,
                      equipment: values,
                    }))
                  }
                />
              </div>

              <textarea
                value={customExercise.description}
                onChange={(e) =>
                  setCustomExercise((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Short description"
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/20"
              />

              <textarea
                value={customExercise.instructions}
                onChange={(e) =>
                  setCustomExercise((prev) => ({
                    ...prev,
                    instructions: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Instructions (comma separated)"
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/20"
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                onClick={addCustomExercise}
                className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Add Custom Exercise
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
