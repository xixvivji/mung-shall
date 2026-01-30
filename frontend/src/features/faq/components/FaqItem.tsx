import { Plus, X } from "lucide-react";

type Props = {
  question: string;
  answer: string;
  open: boolean;
  onClick: () => void;
};

export function FaqItem({ question, answer, open, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-white px-6 py-5 text-left shadow-md transition hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[14px] font-medium text-[#333] leading-relaxed">
          {question}
        </p>
        {open ? (
          <X className="h-5 w-5 text-gray-500" />
        ) : (
          <Plus className="h-5 w-5 text-[#3182f6]" />
        )}
      </div>

      {open && (
        <p className="mt-4 text-[13px] leading-relaxed text-[#888]">{answer}</p>
      )}
    </button>
  );
}
