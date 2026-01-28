import { useState } from "react";
import { Button } from "@/shared/ui/button";

type Props = {
  isEditable: boolean;
};

type ConsultDraft = {
  date: string;
  time: string;
  memo: string;
};

export function ConsultStep({ isEditable }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ConsultDraft>({
    date: "",
    time: "",
    memo: "",
  });

  // 프론트-only 더미 “저장된 값”
  const [saved, setSaved] = useState<ConsultDraft>({
    date: "2026-01-28",
    time: "14:30",
    memo: "대면 상담 희망 (더미)",
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-900">입양 상담</p>
        <p className="mt-1 text-sm text-gray-500">
          상담 일정(날짜/시간/메모)을 등록합니다. (현재는 UI만 구현)
        </p>

        <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">날짜</p>
            <p className="mt-1 font-medium text-gray-900">{saved.date}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">시간</p>
            <p className="mt-1 font-medium text-gray-900">{saved.time}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">메모</p>
            <p className="mt-1 font-medium text-gray-900 truncate">{saved.memo}</p>
          </div>
        </div>

        {isEditable && (
          <div className="mt-5 flex gap-3">
            <Button className="rounded-lg" onClick={() => { setDraft(saved); setOpen(true); }}>
              일정 입력/수정
            </Button>
            <Button variant="outline" className="rounded-lg">
              상담 완료 처리(추후)
            </Button>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="close overlay"
          />
          <div className="relative w-[620px] max-w-[calc(100vw-32px)] rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">상담 일정 입력</p>
                <p className="mt-1 text-sm text-gray-500">(임시) 팝업 형태로 입력 받기</p>
              </div>
              <Button variant="outline" className="rounded-lg" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">날짜</label>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">시간</label>
                  <input
                    type="time"
                    value={draft.time}
                    onChange={(e) => setDraft((p) => ({ ...p, time: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">메모</label>
                <textarea
                  value={draft.memo}
                  onChange={(e) => setDraft((p) => ({ ...p, memo: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="예: 평일 저녁 가능"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" className="rounded-lg" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button
                className="rounded-lg"
                onClick={() => {
                  setSaved(draft);
                  setOpen(false);
                }}
              >
                저장(임시)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
