import { useMemo, useState } from "react";
import "@/shared/styles/uiverse/PostAdoptionStepper.css";

type RoadmapDetail = {
    title: string;
    adopterTodos: string[];
    medicalInfo: string[];
    platformFeatures: string[];
};

type ChecklistState = Record<number, boolean[]>;

type CareStepItem = {
    title: string;
    time?: string;
};

type CareUiStatus = "completed" | "active" | "pending";

const BASE_STEPS: CareStepItem[] = [
    { title: "입양 당일 체크", time: "Day 0" },
    { title: "3일차 체크", time: "Day 3" },
    { title: "1주 적응", time: "Day 7" },
    { title: "2주 점검", time: "Day 14" },
    { title: "1개월 건강 체크", time: "Day 30" },
    { title: "2개월 체크", time: "Day 60" },
    { title: "3개월 마무리", time: "Day 90" },
];

function statusLabel(status: CareUiStatus) {
    if (status === "completed") return "Completed";
    if (status === "active") return "In Progress";
    return "Pending";
}

export function CareStep() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [completedSet, setCompletedSet] = useState<Set<number>>(() => new Set());

    const roadmap = useMemo<RoadmapDetail[]>(
        () => [
            {
                title: "입양 당일 (Day 0)",
                adopterTodos: ["집 도착 사진 업로드", "식사·배변 여부 체크", "이상 행동 체크"],
                medicalInfo: ["기존 예방접종 내역 확인", "중성화 여부 확인", "건강기록 인수"],
                platformFeatures: ["사후관리 시작 상태 전환", "예방접종 이력 자동 표시", "당일 체크리스트 생성"],
            },
            {
                title: "3일차 (Day 3)",
                adopterTodos: ["스트레스/식욕 변화 체크", "근황 사진 또는 영상 업로드"],
                medicalInfo: ["구토·설사·무기력 여부 관찰"],
                platformFeatures: ["건강 이상 키워드 감지", "이상 시 관리자 알림"],
            },
            {
                title: "7일차 (1주)",
                adopterTodos: ["생활 루틴 입력", "1주 후기 작성"],
                medicalInfo: ["종합백신(DHPPL) 1차 여부 확인", "코로나 장염 접종 여부 확인"],
                platformFeatures: ["접종 미완료 시 알림", "예방접종 가이드 제공"],
            },
            {
                title: "2주차 (Day 14)",
                adopterTodos: ["산책 가능 여부 체크", "문제 행동 설문"],
                medicalInfo: ["켄넬코프 접종 권장", "외부 접촉 전 접종 여부 확인"],
                platformFeatures: ["접종 일정 리마인드", "병원 방문 체크 기능"],
            },
            {
                title: "1개월 (30일)",
                adopterTodos: ["건강 설문(식욕·배변·활동량)", "사진 2장 이상 업로드"],
                medicalInfo: ["종합백신 2차 접종 시기", "심장사상충 예방 시작 권장"],
                platformFeatures: ["1개월 건강 리포트 생성", "위험군 자동 분류"],
            },
            {
                title: "2개월 (60일)",
                adopterTodos: ["산책·훈련 유지 체크"],
                medicalInfo: ["종합백신 3차 접종 시기", "외부 활동 안정 가능"],
                platformFeatures: ["접종 완료 여부 확인", "관리 단계 완화"],
            },
            {
                title: "3개월 (90일)",
                adopterTodos: ["최종 후기 작성", "입양 확정 동의"],
                medicalInfo: ["광견병 예방접종 필수", "연간 접종 스케줄 안내"],
                platformFeatures: ["입양 성공 처리", "사후관리 종료"],
            },
        ],
        []
    );

    const [checklist, setChecklist] = useState<ChecklistState>(() => {
        const init: ChecklistState = {};
        roadmap.forEach((r, idx) => {
            init[idx] = new Array(r.adopterTodos.length).fill(false);
        });
        return init;
    });

    const activeStepIndex = useMemo(() => {
        for (let i = 0; i < BASE_STEPS.length; i++) {
            if (!completedSet.has(i)) return i;
        }
        return BASE_STEPS.length - 1;
    }, [completedSet]);

    const stepStates = useMemo(() => {
        return BASE_STEPS.map((s, idx) => {
            const status: CareUiStatus = completedSet.has(idx)
                ? "completed"
                : idx === activeStepIndex
                    ? "active"
                    : "pending";
            return { ...s, status };
        });
    }, [completedSet, activeStepIndex]);

    const selected = roadmap[activeIndex];
    const isCompleted = completedSet.has(activeIndex);

    const selectedChecks = checklist[activeIndex] ?? [];
    const allChecked = selectedChecks.length > 0 && selectedChecks.every(Boolean);

    const toggleTodo = (todoIndex: number) => {
        if (isCompleted) return;
        setChecklist((prev) => {
            const current = prev[activeIndex] ?? [];
            const next = [...current];
            next[todoIndex] = !next[todoIndex];
            return { ...prev, [activeIndex]: next };
        });
    };

    const completeCurrentStep = () => {
        if (isCompleted) return;
        if (!allChecked) return;

        setCompletedSet((prev) => {
            const next = new Set(prev);
            next.add(activeIndex);
            return next;
        });

        setActiveIndex((prevIdx) => Math.min(BASE_STEPS.length - 1, prevIdx + 1));
    };

    const onPrev = () => setActiveIndex((v) => Math.max(0, v - 1));
    const onNext = () => setActiveIndex((v) => Math.min(stepStates.length - 1, v + 1));

    return (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className="stepper-box">
                {stepStates.map((s, idx) => {
                    const stepClass =
                        s.status === "completed"
                            ? "stepper-step stepper-completed"
                            : s.status === "active"
                                ? "stepper-step stepper-active"
                                : "stepper-step stepper-pending";

                    const isSelected = activeIndex === idx;

                    return (
                        <button
                            key={`${s.title}-${idx}`}
                            type="button"
                            className={`${stepClass} ${isSelected ? "stepper-selected" : ""}`}
                            onClick={() => setActiveIndex(idx)}
                            style={{ textAlign: "left", width: "100%" }}
                        >
                            <div className="stepper-circle">
                                {s.status === "completed" ? (
                                    <svg
                                        viewBox="0 0 16 16"
                                        className="bi bi-check-lg"
                                        fill="currentColor"
                                        height="16"
                                        width="16"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                    </svg>
                                ) : (
                                    idx + 1
                                )}
                            </div>

                            <div className="stepper-line" />

                            <div className="stepper-content">
                                <div className="stepper-title">{s.title}</div>
                                <div className="stepper-status">{statusLabel(s.status)}</div>
                                {s.time ? <div className="stepper-time">{s.time}</div> : null}
                            </div>
                        </button>
                    );
                })}

                <div className="stepper-controls">
                    <button type="button" className="stepper-button" onClick={onPrev} disabled={activeIndex === 0}>
                        이전
                    </button>
                    <button
                        type="button"
                        className="stepper-button stepper-button-primary"
                        onClick={onNext}
                        disabled={activeIndex === stepStates.length - 1}
                    >
                        다음
                    </button>
                </div>
            </div>

            {/* 오른쪽 로드맵 상세 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-gray-500">선택한 단계</p>
                        <h3 className="mt-1 text-lg font-semibold text-gray-900">{selected.title}</h3>

                        {isCompleted ? (
                            <p className="mt-2 text-sm text-gray-500">이 단계는 이미 완료되었습니다. 다음 단계로 진행해 주세요.</p>
                        ) : activeIndex !== activeStepIndex ? (
                            <p className="mt-2 text-sm text-gray-500">
                                현재 진행중인 단계는{" "}
                                <span className="font-semibold text-gray-900">{BASE_STEPS[activeStepIndex]?.title}</span> 입니다.
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={completeCurrentStep}
                        disabled={isCompleted || !allChecked || activeIndex !== activeStepIndex}
                        className="h-10 shrink-0 rounded-xl bg-[#0064FF] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        title={
                            isCompleted
                                ? "이미 완료된 단계입니다."
                                : activeIndex !== activeStepIndex
                                    ? "진행중인 단계에서만 완료할 수 있습니다."
                                    : !allChecked
                                        ? "입양자 해야 할 것 항목을 모두 체크하세요."
                                        : "이 단계를 완료합니다."
                        }
                    >
                        {isCompleted ? "완료됨" : "이 단계 완료"}
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <section className="rounded-xl border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900">입양자 해야 할 것</h4>
                        <div className="mt-3 space-y-2">
                            {selected.adopterTodos.map((t, i) => {
                                const checked = selectedChecks[i] ?? false;
                                const disabled = isCompleted || activeIndex !== activeStepIndex;

                                return (
                                    <label
                                        key={t}
                                        className={`flex items-start gap-2 text-sm ${
                                            disabled ? "cursor-default text-gray-500" : "cursor-pointer text-gray-700"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1 h-4 w-4"
                                            checked={checked}
                                            disabled={disabled}
                                            onChange={() => toggleTodo(i)}
                                        />
                                        <span className={checked ? "line-through text-gray-400" : ""}>{t}</span>
                                    </label>
                                );
                            })}
                        </div>

                        <p className="mt-4 text-xs text-gray-400">* 진행중인 단계에서 체크/완료가 가능합니다.</p>
                    </section>

                    <section className="rounded-xl border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900">예방접종 · 의료 정보</h4>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                            {selected.medicalInfo.map((t) => (
                                <li key={t}>{t}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-xl border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900">플랫폼(시스템) 기능</h4>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                            {selected.platformFeatures.map((t) => (
                                <li key={t}>{t}</li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
