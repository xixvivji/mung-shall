import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { ConsultScheduleModal } from "./3_ConsultScheduleModal";

type Props = {
  isEditable: boolean;
};

type ConsultSaved = {
  date: string;     // YYYY-MM-DD
  time: string;     // "HH:mm - HH:mm"
  memo: string;
};

export function ConsultStep({ isEditable }: Props) {
  const [open, setOpen] = useState(false);

  const [saved, setSaved] = useState<ConsultSaved>({
    date: "2026-01-13",
    time: "11:00 - 12:00",
    memo: "대면 상담 희망 (더미)",
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-900">입양 상담</p>
        <p className="mt-1 text-sm text-gray-500">상담 일정(날짜/시간/메모)을 등록합니다. (현재는 UI만 구현)</p>

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

        <div className="mt-5 flex gap-3">
          <Button
            className="rounded-lg"
            disabled={!isEditable}
            onClick={() => {
              if (!isEditable) return;
              setOpen(true);
            }}
          >
            일정 입력/수정
          </Button>
          <Button variant="outline" className="rounded-lg" disabled={!isEditable}>
            상담 완료 처리(추후)
          </Button>
        </div>
      </div>

      <ConsultScheduleModal
        open={open}
        initialDate={saved.date}
        initialStart={saved.time.split(" - ")[0]}
        initialEnd={saved.time.split(" - ")[1]}
        onClose={() => setOpen(false)}
        onConfirm={({ date, startTime, endTime }) => {
          setSaved((p) => ({ ...p, date, time: `${startTime} - ${endTime}` }));
          setOpen(false);
        }}
      />
    </div>
  );
}
