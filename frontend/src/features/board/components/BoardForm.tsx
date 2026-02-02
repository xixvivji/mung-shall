import { useEffect, useMemo, useState, type FormEvent, useCallback } from "react";
import { uploadBoardImage } from "../api/imageApi";
import type { BoardCategory } from "../types";

type BoardFormValues = {
    title: string;
    content: string;
    category?: BoardCategory;
    mediaUrls?: string[];
};

type BoardFormProps = {
    initialValues?: Partial<BoardFormValues>;
    onSubmit: (values: BoardFormValues) => Promise<void> | void;
    onCancel?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    submitting?: boolean;

    showCategory?: boolean;
    initialCategory?: BoardCategory;
    me?: any;
};

type FieldErrors = {
    title?: string;
    content?: string;
    category?: string;
    mediaUrls?: string;
};

function isAdopter(me: any) {
    const t = String(me?.userType ?? "").toUpperCase();
    return t === "ADOPTER";
}

export default function BoardForm({
                                      initialValues,
                                      onSubmit,
                                      onCancel,
                                      submitLabel = "등록하기",
                                      cancelLabel = "취소",
                                      submitting = false,
                                      showCategory = false,
                                      initialCategory = "FREE",
                                      me,
                                  }: BoardFormProps) {
    const canSelectReview = useMemo(() => !!me && isAdopter(me), [me]);

    const [values, setValues] = useState<BoardFormValues>(() => ({
        title: initialValues?.title ?? "",
        content: initialValues?.content ?? "",
        category: initialValues?.category ?? initialCategory,
        mediaUrls: initialValues?.mediaUrls ?? [],
    }));

    useEffect(() => {
        setValues((prev) => ({
            ...prev,
            category: prev.category ? prev.category : initialCategory,
        }));
    }, [initialCategory]);

    useEffect(() => {
        const current = String(values.category ?? "").toUpperCase();
        if (current === "REVIEW" && !canSelectReview) {
            setValues((prev) => ({ ...prev, category: "FREE" }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canSelectReview]);

    const [errors, setErrors] = useState<FieldErrors>({});

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const validate = (next: BoardFormValues) => {
        const nextErrors: FieldErrors = {};
        if (!next.title.trim()) nextErrors.title = "제목을 입력해주세요.";
        if (!next.content.trim()) nextErrors.content = "내용을 입력해주세요.";

        if (showCategory) {
            const c = String(next.category ?? "").toUpperCase();
            if (c !== "FREE" && c !== "REVIEW") nextErrors.category = "카테고리를 선택해주세요.";
            if (c === "REVIEW" && !canSelectReview) {
                nextErrors.category = "입양 완료자만 후기(REVIEW)를 작성할 수 있습니다.";
            }
        }

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
            category: values.category,
            mediaUrls: (values.mediaUrls ?? []).length ? values.mediaUrls : undefined,
        });
    };

    const selectedCategory = (values.category ?? "FREE") as BoardCategory;

    const handlePickFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploadError(null);
        setErrors((prev) => ({ ...prev, mediaUrls: undefined }));

        const fileArray = Array.from(files);

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];

            for (const file of fileArray) {
                if (!file.type.startsWith("image/")) {
                    throw new Error("이미지 파일만 업로드할 수 있습니다.");
                }
                const url = await uploadBoardImage(file);
                uploadedUrls.push(url);
            }

            setValues((prev) => ({
                ...prev,
                mediaUrls: [...(prev.mediaUrls ?? []), ...uploadedUrls],
            }));
        } catch (e: any) {
            const msg = String(e?.message ?? "이미지 업로드에 실패했습니다.");
            setUploadError(msg);
            setErrors((prev) => ({ ...prev, mediaUrls: msg }));
        } finally {
            setUploading(false);
        }
    }, []);

    const handleRemoveMedia = useCallback((url: string) => {
        setValues((prev) => ({
            ...prev,
            mediaUrls: (prev.mediaUrls ?? []).filter((u) => u !== url),
        }));
    }, []);

    // ✅ 이미지 크게보기 모달(폼에서도 동일 UX)
    const mediaUrls = useMemo(() => (Array.isArray(values.mediaUrls) ? values.mediaUrls : []), [values.mediaUrls]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    const openViewer = useCallback((index: number) => {
        setViewerIndex(index);
        setViewerOpen(true);
    }, []);

    const closeViewer = useCallback(() => setViewerOpen(false), []);

    const goPrev = useCallback(() => {
        setViewerIndex((prev) => (mediaUrls.length ? (prev - 1 + mediaUrls.length) % mediaUrls.length : 0));
    }, [mediaUrls.length]);

    const goNext = useCallback(() => {
        setViewerIndex((prev) => (mediaUrls.length ? (prev + 1) % mediaUrls.length : 0));
    }, [mediaUrls.length]);

    const currentUrl = mediaUrls[viewerIndex] ?? "";

    useEffect(() => {
        if (!viewerOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeViewer();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [viewerOpen, closeViewer, goPrev, goNext]);

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
                <label className="text-sm font-semibold text-[#1F2937]">제목</label>
                <input
                    className="h-12 w-full rounded-[12px] border border-[#E5E7EB] px-4 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
                    placeholder="제목을 입력해주세요."
                    value={values.title}
                    onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
                    disabled={submitting || uploading}
                />
                {errors.title ? <p className="text-xs text-[#ef4444]">{errors.title}</p> : null}
            </div>

            {showCategory ? (
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-[#1F2937]">카테고리</label>

                    <select
                        className="h-12 w-full rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-sm text-[#1F2937] outline-none focus:ring-2 focus:ring-[#5B7CFA]"
                        value={selectedCategory}
                        onChange={(event) => {
                            const next = event.target.value.toUpperCase() as BoardCategory;
                            if (next === "REVIEW" && !canSelectReview) {
                                setErrors((prev) => ({
                                    ...prev,
                                    category: "입양 완료자만 후기(REVIEW)를 작성할 수 있습니다.",
                                }));
                                setValues((prev) => ({ ...prev, category: "FREE" }));
                                return;
                            }
                            setErrors((prev) => ({ ...prev, category: undefined }));
                            setValues((prev) => ({ ...prev, category: next }));
                        }}
                        disabled={submitting || uploading}
                    >
                        <option value="FREE">자유(FREE)</option>
                        <option value="REVIEW" disabled={!canSelectReview}>
                            후기(REVIEW)
                        </option>
                    </select>

                    {!canSelectReview ? (
                        <p className="text-xs text-[#6B7280]">
                            후기(REVIEW) 작성은 <span className="font-semibold">입양 완료자(ADOPTER)</span>만 가능합니다.
                        </p>
                    ) : (
                        <p className="text-xs text-[#6B7280]">카테고리에 맞는 게시판으로 등록됩니다.</p>
                    )}

                    {errors.category ? <p className="text-xs text-[#ef4444]">{errors.category}</p> : null}
                </div>
            ) : null}

            <div className="space-y-3">
                <label className="text-sm font-semibold text-[#1F2937]">내용</label>
                <textarea
                    className="min-h-[240px] w-full resize-y rounded-[12px] border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
                    placeholder="내용을 입력해주세요."
                    value={values.content}
                    onChange={(event) => setValues((prev) => ({ ...prev, content: event.target.value }))}
                    disabled={submitting || uploading}
                />
                {errors.content ? <p className="text-xs text-[#ef4444]">{errors.content}</p> : null}
            </div>

            {/* 이미지 업로드 */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-[#1F2937]">이미지 첨부</label>

                <div className="rounded-[16px] border border-dashed border-[#E5E7EB] bg-[#F7F8FA] p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-[#6B7280]">JPG/PNG 등 이미지 파일을 업로드할 수 있습니다.</p>

                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-[12px] bg-white px-4 py-2 text-sm font-semibold text-[#1F2937] shadow-sm ring-1 ring-[#E5E7EB] hover:bg-[#F7F8FA]">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                disabled={submitting || uploading}
                                onChange={(e) => handlePickFiles(e.target.files)}
                            />
                            {uploading ? "업로드 중..." : "파일 선택"}
                        </label>
                    </div>

                    {uploadError ? <p className="mt-3 text-xs text-[#ef4444]">{uploadError}</p> : null}
                    {errors.mediaUrls ? <p className="mt-3 text-xs text-[#ef4444]">{errors.mediaUrls}</p> : null}

                    {mediaUrls.length > 0 ? (
                        <>
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {mediaUrls.map((url, idx) => (
                                    <div
                                        key={url}
                                        className="group relative rounded-[12px] border border-[#E5E7EB] bg-white p-2"
                                    >
                                        {/* ✅ 잘림 방지: object-contain + 배경 */}
                                        <button
                                            type="button"
                                            onClick={() => openViewer(idx)}
                                            className="w-full rounded-[10px] bg-[#F7F8FA] p-2"
                                            title="클릭해서 크게 보기"
                                        >
                                            <img
                                                src={url}
                                                alt="uploaded"
                                                className="h-28 w-full object-contain"
                                                loading="lazy"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                                }}
                                            />
                                        </button>

                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-xs text-[#6B7280]">{idx + 1} / {mediaUrls.length}</span>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMedia(url)}
                                                className="rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ✅ 모달 갤러리 */}
                            {viewerOpen ? (
                                <div
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                                    role="dialog"
                                    aria-modal="true"
                                    onClick={closeViewer}
                                >
                                    <div
                                        className="relative w-full max-w-[980px] rounded-[16px] bg-white shadow-xl"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
                                            <div className="text-sm font-semibold text-[#111827]">
                                                첨부 이미지 {viewerIndex + 1} / {mediaUrls.length}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={currentUrl}
                                                    download
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="h-9 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FA]"
                                                >
                                                    다운로드
                                                </a>

                                                <button
                                                    type="button"
                                                    onClick={closeViewer}
                                                    className="h-9 rounded-[10px] bg-[#111827] px-3 text-sm font-semibold text-white hover:bg-[#0B1220]"
                                                >
                                                    닫기
                                                </button>
                                            </div>
                                        </div>

                                        <div className="relative flex items-center justify-center bg-[#0B1220] p-3">
                                            {mediaUrls.length > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={goPrev}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/30"
                                                    aria-label="prev"
                                                >
                                                    ◀
                                                </button>
                                            ) : null}

                                            <img
                                                src={currentUrl}
                                                alt="viewer"
                                                className="max-h-[72vh] w-auto max-w-full object-contain"
                                                draggable={false}
                                            />

                                            {mediaUrls.length > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={goNext}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/30"
                                                    aria-label="next"
                                                >
                                                    ▶
                                                </button>
                                            ) : null}
                                        </div>

                                        <div className="px-4 py-3 text-xs text-[#6B7280]">
                                            단축키: <span className="font-semibold">← →</span> 이동,{" "}
                                            <span className="font-semibold">ESC</span> 닫기
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <p className="mt-3 text-xs text-[#9CA3AF]">첨부된 이미지가 없습니다.</p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="submit"
                    className="h-12 rounded-[12px] bg-[#5B7CFA] px-6 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={submitting || uploading}
                >
                    {submitting ? "처리 중..." : submitLabel}
                </button>
                <button
                    type="button"
                    className="h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#1F2937] transition hover:bg-[#F7F8FA]"
                    onClick={onCancel}
                    disabled={submitting || uploading || !onCancel}
                >
                    {cancelLabel}
                </button>
            </div>
        </form>
    );
}
