import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  cancelCounseling,
  createCounseling,
  getCounseling,
  updateCounseling,
  type CounselingResponse,
} from "@/features/manage/api/manageApi";
import { ConsultScheduleModal } from "./3_ConsultScheduleModal";

type Props = {
  isEditable: boolean;
  adoptionId?: number;
  onConsultComplete?: () => void;
};

type ConsultSaved = {
  date: string; // YYYY-MM-DD
  time: string; // "HH:mm - HH:mm"
  status?: string;
};

const counselingKey = (adoptionId: number) => `adoptionCounselingId:${adoptionId}`;

const toCounselingDate = (date: string, time: string) => {
  const [hh, mm] = time.split(":");
  return `${date} ${hh ?? "00"}:${mm ?? "00"}:00`;
};

const toTimeRange = (dateTime: string) => {
  const normalized = dateTime.includes("T") ? dateTime : dateTime.replace(" ", "T");
  const dt = new Date(normalized);
  if (Number.isNaN(dt.getTime())) return { date: "", time: "" };
  const pad2 = (v: number) => String(v).padStart(2, "0");
  const date = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
  const start = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
  const endDate = new Date(dt.getTime() + 60 * 60 * 1000);
  const end = `${pad2(endDate.getHours())}:${pad2(endDate.getMinutes())}`;
  return { date, time: `${start} - ${end}` };
};

const resolveCounseling = (data: CounselingResponse | null): ConsultSaved | null => {
  if (!data?.counselingDate) return null;
  const parsed = toTimeRange(data.counselingDate);
  if (!parsed.date) return null;
  return { ...parsed, status: data.status };
};

export function ConsultStep({ isEditable, adoptionId, onConsultComplete }: Props) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<ConsultSaved | null>(null);
  const [counselingId, setCounselingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adoptionId) return;
    const raw = localStorage.getItem(counselingKey(adoptionId));
    const id = raw ? Number(raw) : NaN;
    if (!Number.isFinite(id)) return;

    setLoading(true);
    setError(null);
    getCounseling(id)
      .then((data) => {
        setCounselingId(data.id);
        localStorage.setItem(counselingKey(adoptionId), String(data.id));
        setSaved(resolveCounseling(data));
      })
      .catch(() => {
        localStorage.removeItem(counselingKey(adoptionId));
        setCounselingId(null);
        setSaved(null);
        setError("상담 예약 정보를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [adoptionId]);

  const display = useMemo(() => {
    if (!saved) {
      return {
        date: "-",
        time: "-",
        memo: "상담 일정이 등록되지 않았습니다.",
      };
    }
    return {
      date: saved.date,
      time: saved.time,
      memo: saved.status ?? "SCHEDULED",
    };
  }, [saved]);

  const handleConfirm = async (payload: { date: string; startTime: string; endTime: string }) => {
    if (!adoptionId) return;
    setSaving(true);
    setError(null);
    const counselingDate = toCounselingDate(payload.date, payload.startTime);
    try {
      const response = counselingId
        ? await updateCounseling(counselingId, adoptionId, counselingDate)
        : await createCounseling(adoptionId, counselingDate);
      setCounselingId(response.id);
      localStorage.setItem(counselingKey(adoptionId), String(response.id));
      setSaved({ date: payload.date, time: `${payload.startTime} - ${payload.endTime}`, status: response.status });
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "상담 예약을 저장하지 못했습니다.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!counselingId || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await cancelCounseling(counselingId);
      if (adoptionId) localStorage.removeItem(counselingKey(adoptionId));
      setCounselingId(null);
      setSaved(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "상담 예약 취소에 실패했습니다.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-900">입양 상담</p>
        <p className="mt-1 text-sm text-gray-500">
          상담 일정을 예약하고 변경할 수 있습니다.
        </p>

        {loading ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            상담 정보를 불러오는 중...
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">날짜</p>
            <p className="mt-1 font-medium text-gray-900">{display.date}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">시간</p>
            <p className="mt-1 font-medium text-gray-900">{display.time}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">상태</p>
            <p className="mt-1 font-medium text-gray-900 truncate">{display.memo}</p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <Button
            className="rounded-lg"
            disabled={!isEditable || saving}
            onClick={() => {
              if (!isEditable) return;
              setOpen(true);
            }}
          >
            일정 입력/수정
          </Button>
          <Button
            variant="outline"
            className="rounded-lg"
            disabled={!isEditable || deleting || !counselingId}
            onClick={handleCancel}
          >
            {deleting ? "취소 중..." : "상담 예약 취소"}
          </Button>
          <Button
            variant="outline"
            className="rounded-lg"
            disabled={!isEditable}
            onClick={onConsultComplete}
          >
            상담 완료 처리
          </Button>
        </div>
      </div>

      <ConsultScheduleModal
        open={open}
        initialDate={saved?.date}
        initialStart={saved?.time.split(" - ")[0]}
        initialEnd={saved?.time.split(" - ")[1]}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
