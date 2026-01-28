import { useState } from "react";
import { Button } from "@/shared/ui/button";

type Props = {
  isEditable: boolean;
};

export function ApplicationStep({ isEditable }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">입양 신청서</p>
            <p className="mt-1 text-sm text-gray-500">
              신청서 작성 후 제출하면 심사가 시작됩니다. (현재는 UI만 구현)
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
              isEditable
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            {isEditable ? "작성/제출 가능" : "조회"}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">이름</p>
            <p className="mt-1 font-medium text-gray-900">홍길동 (더미)</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">연락처</p>
            <p className="mt-1 font-medium text-gray-900">010-0000-0000</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">주소</p>
            <p className="mt-1 font-medium text-gray-900">광주광역시 (더미)</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">동거인 여부</p>
            <p className="mt-1 font-medium text-gray-900">있음 (더미)</p>
          </div>
        </div>
      </div>

      {isEditable ? (
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-lg" onClick={() => setOpen(true)}>
            작성/수정하기
          </Button>
          <Button variant="outline" className="rounded-lg">
            제출하기
          </Button>
          <Button variant="outline" className="rounded-lg border-red-200 text-red-600 hover:bg-red-50">
            삭제하기
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">현재는 조회만 가능합니다.</p>
      )}

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
                <p className="text-lg font-semibold text-gray-900">입양 신청서 작성</p>
                <p className="mt-1 text-sm text-gray-500">(임시) 여기서 신청서 입력 팝업을 만들 예정</p>
              </div>
              <Button variant="outline" className="rounded-lg" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              신청서 입력 폼 자리
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" className="rounded-lg" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button className="rounded-lg" onClick={() => setOpen(false)}>
                저장(임시)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
