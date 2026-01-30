import { useState, type FormEvent } from "react";

type BoardFormValues = {
  title: string;
  content: string;
  category?: string;
};

type BoardFormProps = {
  initialValues?: Partial<BoardFormValues>;
  onSubmit: (values: BoardFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitting?: boolean;
  showCategory?: boolean;
};

type FieldErrors = {
  title?: string;
  content?: string;
};

export default function BoardForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "등록하기",
  cancelLabel = "취소",
  submitting = false,
  showCategory = true,
}: BoardFormProps) {
  const [values, setValues] = useState<BoardFormValues>(() => ({
    title: initialValues?.title ?? "",
    content: initialValues?.content ?? "",
    category: initialValues?.category ?? "",
  }));
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (next: BoardFormValues) => {
    const nextErrors: FieldErrors = {};
    if (!next.title.trim()) nextErrors.title = "제목을 입력해주세요.";
    if (!next.content.trim()) nextErrors.content = "내용을 입력해주세요.";
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit({
      title: values.title.trim(),
      content: values.content.trim(),
      category: values.category?.trim() || undefined,
    });
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <label className="text-sm font-semibold text-[#1F2937]">제목</label>
        <input
          className="h-12 w-full rounded-[12px] border border-[#E5E7EB] px-4 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
          placeholder="제목을 입력해주세요."
          value={values.title}
          onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
          disabled={submitting}
        />
        {errors.title ? <p className="text-xs text-[#ef4444]">{errors.title}</p> : null}
      </div>

      {showCategory ? (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-[#1F2937]">카테고리 (선택)</label>
          <input
            className="h-12 w-full rounded-[12px] border border-[#E5E7EB] px-4 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
            placeholder="카테고리를 입력해주세요."
            value={values.category}
            onChange={(event) => setValues((prev) => ({ ...prev, category: event.target.value }))}
            disabled={submitting}
          />
        </div>
      ) : null}

      <div className="space-y-3">
        <label className="text-sm font-semibold text-[#1F2937]">내용</label>
        <textarea
          className="min-h-[240px] w-full resize-y rounded-[12px] border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
          placeholder="내용을 입력해주세요."
          value={values.content}
          onChange={(event) => setValues((prev) => ({ ...prev, content: event.target.value }))}
          disabled={submitting}
        />
        {errors.content ? <p className="text-xs text-[#ef4444]">{errors.content}</p> : null}
      </div>

      <div className="rounded-[16px] border border-dashed border-[#E5E7EB] bg-[#F7F8FA] p-6 text-sm text-[#6B7280]">
        이미지 업로드 기능은 추후 지원될 예정입니다.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="h-12 rounded-[12px] bg-[#5B7CFA] px-6 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "처리 중..." : submitLabel}
        </button>
        <button
          type="button"
          className="h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#1F2937] transition hover:bg-[#F7F8FA]"
          onClick={onCancel}
          disabled={submitting || !onCancel}
        >
          {cancelLabel}
        </button>
      </div>
    </form>
  );
}
