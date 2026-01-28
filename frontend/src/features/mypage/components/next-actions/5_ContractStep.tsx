import { useState } from "react";
import { Button } from "@/shared/ui/button";

type Props = {
  isEditable: boolean;
};

export function ContractStep({ isEditable }: Props) {
  const [open, setOpen] = useState(false);
  const [agree, setAgree] = useState(false);
  const [esign, setEsign] = useState(true);

  const canSubmit = isEditable && agree;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-900">입양 계약서</p>
        <p className="mt-1 text-sm text-gray-500">
          계약서를 확인하고 동의 후 서명(전자서명 여부)을 선택합니다. (현재는 UI만 구현)
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-lg" onClick={() => setOpen(true)}>
            계약서 보기
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              disabled={!isEditable}
            />
            <span className={`${!isEditable ? "text-gray-400" : "text-gray-700"}`}>
              계약서 내용을 확인했으며 동의합니다.
            </span>
          </label>

          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">전자서명</p>
              <p className="text-xs text-gray-500 mt-1">전자서명 사용 여부를 선택하세요.</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={esign}
                onChange={(e) => setEsign(e.target.checked)}
                disabled={!isEditable}
              />
              <span className={`${!isEditable ? "text-gray-400" : "text-gray-700"}`}>
                사용
              </span>
            </label>
          </div>
        </div>

        {isEditable && (
          <div className="mt-6 flex gap-3">
            <Button className="rounded-lg" disabled={!canSubmit}>
              서명/제출
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                setAgree(false);
                setEsign(true);
              }}
            >
              초기화
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
          <div className="relative w-[720px] max-w-[calc(100vw-32px)] rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">계약서 보기</p>
                <p className="mt-1 text-sm text-gray-500">(임시) 계약서 뷰어/다운로드 영역</p>
              </div>
              <Button variant="outline" className="rounded-lg" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              계약서 내용/뷰어 자리
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
