import { useState } from "react";

type Suggestion = {
  key: string;
  name: string;
  frequency: number;
  reason: string;
};

type OptimiseResponse = {
  success: boolean;
  couldOptimise: boolean;
  noData: boolean;
  message: string;
  usedFallback: boolean;
  analysedRoutineCount: number;
  addSuggestions: Suggestion[];
  removeSuggestions: Suggestion[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  routineId: string;
  routineTitle: string;
};

export default function OptimiseRoutineModal({
  isOpen,
  onClose,
  routineId,
  routineTitle,
}: Props) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [result, setResult] = useState<OptimiseResponse | null>(null);

  if (!isOpen) return null;

  const handleOptimise = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setHasRun(true);

      const res = await fetch(`/api/routines/${routineId}/optimise`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to optimise routine");
        return;
      }

      setResult(data);
    } catch (error) {
      console.error("Optimisation failed:", error);
      alert("Failed to optimise routine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold">Optimise routine</h2>
            <p className="mt-1 text-sm text-gray-500">{routineTitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          {!hasRun && (
            <div className="space-y-4">
              <p className="text-gray-700">
                This optimiser checks similar popular routines and suggests
                exercises you may want to add or remove. It prioritises recent
                routines from the last 90 days and falls back to older routines
                if recent data is limited.
              </p>

              <button
                type="button"
                onClick={handleOptimise}
                disabled={loading}
                className="rounded-lg bg-black px-5 py-3 text-white hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Optimising..." : "Run optimiser"}
              </button>
            </div>
          )}

          {hasRun && loading && (
            <p className="text-gray-600">Analysing similar routines...</p>
          )}

          {hasRun && !loading && result && (
            <div className="space-y-6">
              <div className="rounded-xl border bg-gray-50 p-4">
                <p className="font-semibold">{result.message}</p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Analysed routines: {result.analysedRoutineCount}</p>
                  <p>
                    Search mode:{" "}
                    {result.usedFallback
                      ? "Recent data was limited, so older routines were included."
                      : "Recent 90-day data used successfully."}
                  </p>
                </div>
              </div>

              {result.noData && (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                  Could not optimise due to lack of data.
                </div>
              )}

              {!result.noData && !result.couldOptimise && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-700">
                  No strong optimisation suggestions were found based on the
                  routines analysed.
                </div>
              )}

              {result.couldOptimise && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* ADDITIONS */}
                  <div className="rounded-2xl border p-5">
                    <h3 className="text-lg font-bold">Suggested additions</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      These exercises appear frequently in similar routines.
                    </p>

                    <div className="mt-4 space-y-3">
                      {result.addSuggestions.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No strong additions suggested.
                        </p>
                      ) : (
                        result.addSuggestions.map((item) => (
                          <div
                            key={item.key}
                            className="rounded-xl border bg-green-50 p-4"
                          >
                            <p className="font-semibold">{item.name}</p>
                            <p className="mt-1 text-sm text-gray-600">
                              {item.reason}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* REMOVALS */}
                  <div className="rounded-2xl border p-5">
                    <h3 className="text-lg font-bold">Suggested removals</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      These exercises appeared rarely in similar popular
                      routines.
                    </p>

                    <div className="mt-4 space-y-3">
                      {result.removeSuggestions.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No strong removals suggested.
                        </p>
                      ) : (
                        result.removeSuggestions.map((item) => (
                          <div
                            key={item.key}
                            className="rounded-xl border bg-red-50 p-4"
                          >
                            <p className="font-semibold">{item.name}</p>
                            <p className="mt-1 text-sm text-gray-600">
                              {item.reason}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleOptimise}
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
                >
                  Run again
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
