import { Check, CheckCircle2, Circle, FileText, Monitor, Smartphone } from "lucide-react";

type StageStatus = "completed" | "current" | "pending";

type Stage = {
  id: string;
  title: string;
  status: StageStatus;
  substeps: { title: string; status: StageStatus }[];
};

const stages: Stage[] = [
  {
    id: "A",
    title: "입양 전",
    status: "completed",
    substeps: [
      { title: "프로필 등록", status: "completed" },
      { title: "입양 성향 설문 작성", status: "completed" },
      { title: "입양할 유기견 선택하기", status: "completed" },
    ],
  },
  {
    id: "B",
    title: "입양 중",
    status: "current",
    substeps: [
      { title: "입양 조건 설문 작성", status: "completed" },
      { title: "입양 신청서 작성", status: "pending" },
      { title: "입양 심사 (3~5일 소요)", status: "pending" },
    ],
  },
  {
    id: "C",
    title: "입양 후",
    status: "pending",
    substeps: [
      { title: "반려견 인수", status: "pending" },
      { title: "사후 관리", status: "pending" },
    ],
  },
];

const processCards = [
  {
    title: "입양 조건 설문 작성",
    icon: Smartphone,
    status: "completed",
    actionLabel: "제출 완료",
  },
  {
    title: "입양 신청서 작성",
    icon: FileText,
    status: "active",
    actionLabel: "작성하기",
  },
  {
    title: "입양 심사 (3~5일 소요)",
    icon: Monitor,
    status: "pending",
    actionLabel: "다음 단계",
  },
];

export function AdoptionTimeline() {
  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
      <h2 className="text-[32px] font-semibold text-[#5f7cf7] mb-10">입양 과정</h2>

      <div className="relative mb-12">
        <div className="absolute left-[16.666%] right-[16.666%] top-[36px] h-[2px] bg-gray-200" />
        <div className="absolute left-[16.666%] top-[36px] h-[2px] bg-[#5f7cf7] w-[33.333%]" />

        <div className="grid grid-cols-3 items-start text-center">
          {stages.map((stage) => (
            <div key={stage.id} className="flex flex-col items-center gap-6">
              {stage.status === "completed" && (
                <div className="w-20 h-20 rounded-full bg-[#5f7cf7] text-white flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              )}
              {stage.status === "current" && (
                <div className="w-20 h-20 rounded-full border-2 border-[#5f7cf7] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-[#5f7cf7]" />
                </div>
              )}
              {stage.status === "pending" && (
                <div className="w-20 h-20 rounded-full border-2 border-gray-200 flex items-center justify-center" />
              )}
              <span
                className={`text-2xl font-semibold ${
                  stage.status === "current" ? "text-[#5f7cf7]" : "text-gray-300"
                }`}
              >
                {stage.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-10">
        {stages.map((stage) => (
          <div key={stage.id}>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#5f7cf7] mb-4">
              {stage.status === "pending" ? "TODO" : "COMPLETED"}
            </p>
            <div className="space-y-4">
              {stage.substeps.map((substep, index) => {
                const isDone = substep.status === "completed";
                const isTodo = substep.status === "pending";
                return (
                  <div
                    key={`${stage.id}-${index}`}
                    className={`flex items-center gap-4 rounded-2xl border px-4 py-4 shadow-sm ${
                      isTodo ? "bg-[#eef2ff] border-[#c7d2fe]" : "bg-white border-gray-200"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        isDone ? "bg-[#c7d2fe] text-[#5f7cf7]" : "border-2 border-[#5f7cf7] text-[#5f7cf7]"
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-transparent" />}
                    </div>
                    <span className={`text-sm font-medium ${isDone ? "text-gray-500" : "text-gray-900"}`}>
                      {substep.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      
    </div>
  );
}
