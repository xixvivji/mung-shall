import { useEffect } from "react";

export type AlertModalProps = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export default function AlertModal({ open, title = "알림", message, onClose }: AlertModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
      >
        <h2 id="alert-modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-3 text-sm text-slate-600 whitespace-pre-line">{message}</p>
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-[#3182f6] px-4 py-2 text-sm font-semibold text-white"
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
}
