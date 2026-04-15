import { useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";

type ShareRoutineButtonProps = {
  routineId: string;
  title: string;
  className?: string;
};

export default function ShareRoutineButton({
  routineId,
  title,
  className = "",
}: ShareRoutineButtonProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const routineUrl = `${window.location.origin}/routines/${routineId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(routineUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy link");
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);

      if (navigator.share) {
        await navigator.share({
          title,
          text: `Check out this workout plan: ${title}`,
          url: routineUrl,
        });
        return;
      }

      await copyLink();
    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleShare}
        disabled={sharing}
        className="mt-4 inline-flex items-center gap-1 rounded-xl border border-black/10 px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
      >
        <Share2 size={16} />
        {sharing ? "Sharing..." : "Share"}
      </button>

      <button
        type="button"
        onClick={copyLink}
        className="mt-4 inline-flex items-center gap-1 rounded-xl border w-full border-black/10 px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      >
        {copied ? <Check size={16} /> : <LinkIcon size={16} />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
