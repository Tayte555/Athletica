type ErrorModalProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export default function ErrorModal({
  isOpen,
  title = "Something went wrong",
  message,
  onClose,
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">{message}</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
