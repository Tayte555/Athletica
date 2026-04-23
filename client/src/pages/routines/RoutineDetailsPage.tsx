import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Navbar from "../../components/UI/Navbar";
import Footer from "../../components/UI/Footer";
import { apiDelete, apiGet, apiPost } from "../../lib/routineApi";
import type { Routine } from "../../types/routine";
import { Bookmark, Edit, Heart, MessageCircle, Sparkles } from "lucide-react";
import ShareRoutineButton from "../../components/routines/ShareRoutineButton";
import OptimiseRoutineModal from "../../components/routines/OptimiseRoutineModal";

type RoutineComment = {
  _id: string;
  text: string;
  createdAt: string;
  user?: {
    _id?: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
};

export default function RoutineDetailsPage() {
  const { id } = useParams();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [comments, setComments] = useState<RoutineComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [showOptimiseModal, setShowOptimiseModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        setLoading(true);
        setError("");

        const [routineData, commentsData] = await Promise.all([
          apiGet<Routine>(`/api/routines/${id}`),
          apiGet<RoutineComment[]>(`/api/routines/${id}/comments`),
        ]);

        setRoutine(routineData);
        setComments(commentsData);
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

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSaveLoading(true);

      const updated = routine.isSaved
        ? await apiDelete<Routine>(`/api/routines/${routine._id}/save`)
        : await apiPost<Routine>(`/api/routines/${routine._id}/save`);

      setRoutine((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
            }
          : updated,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update save state",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!routine) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLikeLoading(true);

      const updated = await apiPost<{
        _id: string;
        likesCount: number;
        isLiked: boolean;
      }>(`/api/routines/${routine._id}/like`);

      setRoutine((prev) =>
        prev
          ? {
              ...prev,
              likesCount: updated.likesCount,
              isLiked: updated.isLiked,
            }
          : prev,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update like state",
      );
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!commentText.trim() || !id) return;

    try {
      setCommentLoading(true);

      const newComment = await apiPost<RoutineComment>(
        `/api/routines/${id}/comments`,
        { text: commentText.trim() },
      );

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setCommentLoading(false);
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

      <main className="mx-auto w-full max-w-[1300px] px-6 pb-28 pt-10 md:px-10 lg:px-16">
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
                  src={`http://localhost:5555${routine.image}`}
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

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-black/10 p-4">
                  <p className="text-sm text-[#666]">Saved by</p>
                  <p className="mt-1 text-lg font-semibold">
                    {routine.savedByCount || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 p-4">
                  <p className="text-sm text-[#666]">Likes</p>
                  <p className="mt-1 text-lg font-semibold">
                    {routine.likesCount || 0}
                  </p>
                </div>
              </div>

              {routine.isOwner && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    to={`/routines/${routine._id}/edit`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-medium transition hover:bg-black/5"
                  >
                    <Edit size={16} />
                    Edit Routine
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowOptimiseModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    <Sparkles size={16} />
                    Optimise
                  </button>
                </div>
              )}

              <div className=" grid grid-cols-2 gap-3">
                <ShareRoutineButton
                  routineId={routine._id}
                  title={routine.title}
                  className="w-full"
                />
                <a
                  href="#comments"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-medium transition hover:bg-black/5"
                >
                  <MessageCircle size={16} />
                  Comments ({comments.length})
                </a>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleLikeToggle}
                  disabled={likeLoading}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-60 ${
                    routine.isLiked
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:bg-black/5"
                  }`}
                >
                  <Heart
                    size={16}
                    fill={routine.isLiked ? "currentColor" : "none"}
                  />
                  {likeLoading
                    ? "Updating..."
                    : routine.isLiked
                      ? "Unlike Routine"
                      : "Like Routine"}
                </button>

                <button
                  onClick={handleSaveToggle}
                  disabled={saveLoading}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-60 ${
                    routine.isSaved
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:bg-black/5"
                  }`}
                >
                  <Bookmark
                    size={16}
                    fill={routine.isSaved ? "currentColor" : "none"}
                  />

                  {saveLoading
                    ? "Updating..."
                    : routine.isSaved
                      ? "Unsave Routine"
                      : "Save Routine"}
                </button>
              </div>
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

        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold md:text-3xl">Exercises</h2>
            <p className="mt-1 text-sm text-[#666]">
              Step-by-step breakdown of the routine.
            </p>
          </div>

          <div className="grid gap-4">
            {routine.exercises.map((item, index) => (
              <div
                key={`${item.exercise?._id || item.customExercise?.name || "exercise"}-${item.order || index}`}
                className="rounded-[24px] border border-black/10 bg-white p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {item.order}.{" "}
                      {item.exerciseData?.name ||
                        item.customExercise?.name ||
                        "Exercise"}
                    </h3>
                    <p className="mt-1 text-sm text-[#666]">
                      {item.exerciseData?.muscleGroup ||
                        item.customExercise?.muscleGroup ||
                        "General"}
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

                {(item.exerciseData?.description ||
                  item.customExercise?.description) && (
                  <p className="mt-4 text-sm text-[#555]">
                    {item.exerciseData?.description ||
                      item.customExercise?.description}
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

        <section
          id="comments"
          className="rounded-[28px] border border-black/10 bg-white p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Comments</h2>
              <p className="mt-1 text-sm text-[#666]">
                Share feedback and thoughts on this workout plan.
              </p>
            </div>

            <div className="rounded-full bg-black/5 px-3 py-1 text-sm font-medium">
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </div>
          </div>

          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment about this routine..."
              className="min-h-[120px] w-full rounded-2xl border border-black/10 bg-white p-4 text-sm outline-none focus:border-black/25"
              maxLength={500}
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-[#777]">{commentText.length}/500</p>

              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {commentLoading ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>

          {comments.length === 0 ? (
            <div className="rounded-2xl bg-black/5 px-4 py-6 text-sm text-[#666]">
              No comments yet. Be the first to share your thoughts on this
              routine.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <article
                  key={comment._id}
                  className="rounded-2xl border border-black/10 bg-[#fafafa] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {comment.user?.name || comment.user?.username || "User"}
                      </p>
                      <p className="text-xs text-[#777]">
                        @{comment.user?.username || "user"}
                      </p>
                    </div>

                    <p className="text-xs text-[#777]">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="text-sm text-[#444]">{comment.text}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {routine.isOwner && (
        <OptimiseRoutineModal
          isOpen={showOptimiseModal}
          onClose={() => setShowOptimiseModal(false)}
          routineId={routine._id}
          routineTitle={routine.title}
        />
      )}

      <Footer />
    </div>
  );
}
