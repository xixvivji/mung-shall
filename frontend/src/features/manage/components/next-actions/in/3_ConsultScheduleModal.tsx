import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";

type Props = {
  open: boolean;
  initialDate?: string; // "YYYY-MM-DD"
  initialStart?: string; // "HH:mm"
  initialEnd?: string; // "HH:mm"
  onClose: () => void;
  onConfirm: (payload: { date: string; startTime: string; endTime: string }) => void;
};

type Slot = { start: string; end: string };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseYMD(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function addMonths(date: Date, diff: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + diff);
  return d;
}
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * ✅ 이미지와 동일한 슬롯: 09~15시 (11-12 선택된 상태처럼)
 * 필요하면 slots만 바꿔서 사용
 */
const DEFAULT_SLOTS: Slot[] = [
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
];

export function ConsultScheduleModal({
  open,
  initialDate,
  initialStart,
  initialEnd,
  onClose,
  onConfirm,
}: Props) {
  // 초기값 세팅
  const initDate = initialDate ? parseYMD(initialDate) : new Date();
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(initDate));
  const [selectedDate, setSelectedDate] = useState<string>(initialDate ?? toYMD(new Date()));

  // 선택 슬롯(이미지처럼 “시작/종료” 두칸이 한 세트)
  const [selectedSlot, setSelectedSlot] = useState<Slot>(() => {
    if (initialStart && initialEnd) return { start: initialStart, end: initialEnd };
    return DEFAULT_SLOTS[2]; // 11:00-12:00 디폴트
  });

  const monthTitle = useMemo(() => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth() + 1;
    return `${y}년 ${m}월`;
  }, [viewMonth]);

  // 달력(월) 6주 고정 그리드 생성 (Mo 시작)
  const calendarCells = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const last = endOfMonth(viewMonth);

    // JS getDay(): Sun=0..Sat=6
    // 월요일 시작으로 바꾸기: (day+6)%7  => Mon=0..Sun=6
    const firstDayIdx = (first.getDay() + 6) % 7;

    const cells: Array<{ date: Date; inMonth: boolean }> = [];

    // 이전달 채우기
    for (let i = 0; i < firstDayIdx; i++) {
      const d = new Date(first);
      d.setDate(first.getDate() - (firstDayIdx - i));
      cells.push({ date: d, inMonth: false });
    }

    // 이번달
    for (let day = 1; day <= last.getDate(); day++) {
      cells.push({ date: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day), inMonth: true });
    }

    // 다음달 채워서 6주(42칸) 맞추기
    while (cells.length < 42) {
      const d = new Date(last);
      d.setDate(last.getDate() + (cells.length - (firstDayIdx + last.getDate()) + 1));
      cells.push({ date: d, inMonth: false });
    }

    return cells;
  }, [viewMonth]);

  const rightTitle = useMemo(() => {
    // 이미지처럼: "1월 13일"
    const d = parseYMD(selectedDate);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }, [selectedDate]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="close overlay"
      />

      {/* modal */}
      <div className="relative w-[860px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex">
          {/* LEFT: calendar */}
          <div className="w-[52%] p-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                onClick={() => setViewMonth((m) => startOfMonth(addMonths(m, -1)))}
                aria-label="prev month"
              >
                ‹
              </button>

              <p className="text-lg font-semibold text-gray-900">{monthTitle}</p>

              <button
                type="button"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                onClick={() => setViewMonth((m) => startOfMonth(addMonths(m, +1)))}
                aria-label="next month"
              >
                ›
              </button>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-y-3 text-center text-sm">
              {/* week header (Mo..Su) */}
              {["Mo", "Tu", "We", "Th", "Fr", "Sat", "Su"].map((w) => (
                <div key={w} className="text-xs font-semibold text-gray-500">
                  {w}
                </div>
              ))}

              {/* days */}
              {calendarCells.map((cell, idx) => {
                const ymd = toYMD(cell.date);
                const isSelected = ymd === selectedDate;

                return (
                  <button
                    key={`${ymd}-${idx}`}
                    type="button"
                    onClick={() => setSelectedDate(ymd)}
                    className={[
                      "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm",
                      cell.inMonth ? "text-gray-900" : "text-gray-300",
                      isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-100",
                    ].join(" ")}
                    aria-label={`day ${ymd}`}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* divider */}
          <div className="w-px bg-gray-100" />

          {/* RIGHT: time slots */}
          <div className="w-[48%] p-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{rightTitle}</p>
            </div>

            <div className="mt-6 space-y-4">
              {DEFAULT_SLOTS.map((slot) => {
                const active = slot.start === selectedSlot.start && slot.end === selectedSlot.end;

                // 이미지처럼: 시작, 하이픈, 종료 3열
                return (
                  <div key={`${slot.start}-${slot.end}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={[
                        "h-11 rounded-lg border px-4 text-sm",
                        active ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {slot.start}
                    </button>

                    <span className="text-gray-400">–</span>

                    <button
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={[
                        "h-11 rounded-lg border px-4 text-sm",
                        active ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {slot.end}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* bottom actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Button variant="outline" className="rounded-lg" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="mypage"
            className="rounded-lg"
            onClick={() => onConfirm({ date: selectedDate, startTime: selectedSlot.start, endTime: selectedSlot.end })}
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
