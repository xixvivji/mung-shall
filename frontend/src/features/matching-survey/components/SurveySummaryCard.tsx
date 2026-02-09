import type { AdoptionSurveyAnswer } from "../model/types";
import { STEP_CONFIG } from "../model/options";

type Props = {
  answer: AdoptionSurveyAnswer;
};

function labelFor(field: keyof AdoptionSurveyAnswer, value?: string) {
  if (!value) return "-";

  const step = Object.values(STEP_CONFIG).find((c) => c.field === field);
  if (!step) return value;

  const opt = step.options.find((o) => o.value === value);
  return opt ? opt.label : value;
}

export default function SurveySummaryCard({ answer }: Props) {
  const rows: Array<{ key: keyof AdoptionSurveyAnswer; title: string; value?: string }> = [
    { key: "restActivityLevel", title: "활동성(휴식 시)", value: answer.restActivityLevel },
    { key: "residenceType", title: "거주 형태", value: answer.residenceType },
    { key: "houseEmptyTime", title: "외출 시간", value: answer.houseEmptyTime },
    { key: "furTolerance", title: "털 빠짐 허용", value: answer.furTolerance },
    { key: "visitorFrequency", title: "방문자 빈도", value: answer.visitorFrequency },
  ];

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">내 추천 설문</div>
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <span className="text-[#555]">{r.title}</span>
            <span className="font-semibold">{labelFor(r.key, r.value)}</span>
          </div>
        ))}
      </div>

      <div className="text-xs text-[#777]">
        설문 값은 추천 및 매칭에만 사용돼요.
      </div>
    </div>
  );
}
