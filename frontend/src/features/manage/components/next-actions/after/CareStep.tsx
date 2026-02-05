import { useEffect, useMemo, useState } from "react";
import "@/shared/styles/uiverse/PostAdoptionStepper.css";

type RoadmapDetail = {
    title: string;
    adopterTodos: string[];
    medicalInfo: string[];
};

type ChecklistState = Record<number, boolean[]>;
type MedicalChecklistState = Record<number, boolean[]>;

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

const PHOTO_ACCEPT_TYPES = ".jpg,.jpeg,.png";
const MAX_PHOTO_MB = 10;

function validatePhoto(file: File): string | null {
    const maxBytes = MAX_PHOTO_MB * 1024 * 1024;
    if (file.size > maxBytes) return `파일 용량은 ${MAX_PHOTO_MB}MB 이하여야 합니다.`;

    const lower = file.name.toLowerCase();
    const okExt = [".jpg", ".jpeg", ".png"].some((ext) => lower.endsWith(ext));
    if (!okExt) return "JPG/PNG 파일만 업로드 가능합니다.";

    return null;
}

export function CareStep() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [completedSet, setCompletedSet] = useState<Set<number>>(() => new Set());

    const roadmap = useMemo<RoadmapDetail[]>(
        () => [
            {
                title: "입양 당일 (Day 0)",
                adopterTodos: [
                    "조용한 휴식 공간 마련(안전 구역 고정)",
                    "만지기/사진/손님 최소화",
                    "식사·배변 시간 간단 기록",
                    "산책은 상황 봐서 짧게(무리 금지)",
                    "식사·배변 여부 체크",
                    "이상 행동 체크",
                ],
                medicalInfo: [
                    "기존 예방접종 내역 확인",
                    "중성화 여부 확인",
                    "건강기록 인수",
                    "접종 스케줄(2주 간격) 확인",
                ],
            },
            {
                title: "3일차 체크 (Day 1–3)",
                adopterTodos: [
                    "휴식 공간 유지(환경 크게 바꾸지 않기)",
                    "식사·배변 기록 계속하기",
                    "산책은 짧게, 스트레스 신호 보이면 중단",
                    "배변 실수 줄어드는지 확인",
                ],
                medicalInfo: ["구토·설사·무기력 여부 관찰", "접종 후 이상 반응(무기력/식욕저하) 체크"],
            },
            {
                title: "1주 적응 (Day 4–7)",
                adopterTodos: [
                    "집 루틴 만들기(식사-휴식-짧은 산책)",
                    "하네스 적응(간식으로 긍정 연결)",
                    "‘이름-시선’ 5분씩 연습",
                    "혼자 있는 연습 1–5분부터 시작",
                ],
                medicalInfo: ["종합백신 1차 + 코로나장염 1차 확인", "다음 접종(2주 후) 일정 인지"],
            },
            {
                title: "2주 점검 (Day 14)",
                adopterTodos: [
                    "배변 루틴 강화(성공 시 즉시 보상)",
                    "‘앉아/기다려/이리와’ 짧게 연습",
                    "손/발/귀 만지기 허용 훈련",
                    "사회화는 ‘노출’만 진행",
                ],
                medicalInfo: ["종합백신 2차 + 코로나장염 2차 체크", "외부 활동 전 접종 여부 확인"],
            },
            {
                title: "1개월 건강 체크 (Day 30)",
                adopterTodos: [
                    "루틴 안정화 및 생활 적응 확인",
                    "사람/개 만남은 선택권 제공",
                    "장난감·퍼즐로 에너지 해소",
                    "건강 설문(식욕·배변·활동량)",
                    "보호소와 사후관리 화상 상담 진행",
                ],
                medicalInfo: ["종합백신 3차 접종 여부 확인", "심장사상충·외부기생충 예방 여부 체크"],
            },
            {
                title: "2개월 체크 (Day 60)",
                adopterTodos: ["산책·훈련 루틴 유지 확인", "혼자 있는 시간 10–30분 유지", "문제 행동 발생 여부 점검", "사후관리 화상 채팅 참여"],
                medicalInfo: ["종합백신 4차 + 켄넬코프 접종 여부 확인", "외부 활동 안정 여부 점검"],
            },
            {
                title: "3개월 마무리 (Day 90)",
                adopterTodos: ["최종 후기 작성", "입양 확정 동의", "분리·자극 상황에서 안정 여부 확인", "최종 사후관리 화상 상담 진행"],
                medicalInfo: ["광견병 예방접종 여부 확인", "연간 예방접종 스케줄 안내 확인"],
            },
        ],
        []
    );

    const [day0Photo, setDay0Photo] = useState<{ file: File | null; previewUrl?: string; error?: string }>({ file: null });

    // ✅ 언마운트 시 미리보기 URL 정리
    useEffect(() => {
        return () => {
            if (day0Photo.previewUrl) URL.revokeObjectURL(day0Photo.previewUrl);
        };
    }, [day0Photo.previewUrl]);

    const [checklist, setChecklist] = useState<ChecklistState>({});
    const [medicalChecklist, setMedicalChecklist] = useState<MedicalChecklistState>({});

    // ✅ roadmap 길이/항목 수 변경에도 체크리스트 길이 동기화(안정화)
    useEffect(() => {
        setChecklist((prev) => {
            const next: ChecklistState = { ...prev };
            roadmap.forEach((r, idx) => {
                if (!next[idx] || next[idx].length !== r.adopterTodos.length) {
                    next[idx] = new Array(r.adopterTodos.length).fill(false);
                }
            });
            return next;
        });

        setMedicalChecklist((prev) => {
            const next: MedicalChecklistState = { ...prev };
            roadmap.forEach((r, idx) => {
                if (!next[idx] || next[idx].length !== r.medicalInfo.length) {
                    next[idx] = new Array(r.medicalInfo.length).fill(false);
                }
            });
            return next;
        });
    }, [roadmap]);

    const activeStepIndex = useMemo(() => {
        for (let i = 0; i < BASE_STEPS.length; i++) {
            if (!completedSet.has(i)) return i;
        }
        return BASE_STEPS.length - 1;
    }, [completedSet]);

    const stepStates = useMemo(() => {
        return BASE_STEPS.map((s, idx) => {
            const status: CareUiStatus = completedSet.has(idx) ? "completed" : idx === activeStepIndex ? "active" : "pending";
            return { ...s, status };
        });
    }, [completedSet, activeStepIndex]);

    const selected = roadmap[activeIndex];
    const isCompleted = completedSet.has(activeIndex);

    const selectedChecks = checklist[activeIndex] ?? [];
    const selectedMedicalChecks = medicalChecklist[activeIndex] ?? [];

    const allCheckedTodos = selectedChecks.length > 0 && selectedChecks.every(Boolean);
    const allCheckedMedical = selectedMedicalChecks.length > 0 && selectedMedicalChecks.every(Boolean);

    const needsDay0Photo = activeIndex === 0;
    const day0PhotoOk = !needsDay0Photo || !!day0Photo.file;

    const canCompleteCurrent = !isCompleted && activeIndex === activeStepIndex && allCheckedTodos && allCheckedMedical && day0PhotoOk;

    const toggleTodo = (todoIndex: number) => {
        if (isCompleted) return;
        setChecklist((prev) => {
            const current = prev[activeIndex] ?? [];
            const next = [...current];
            next[todoIndex] = !next[todoIndex];
            return { ...prev, [activeIndex]: next };
        });
    };

    const toggleMedical = (idx: number) => {
        if (isCompleted) return;
        setMedicalChecklist((prev) => {
            const current = prev[activeIndex] ?? [];
            const next = [...current];
            next[idx] = !next[idx];
            return { ...prev, [activeIndex]: next };
        });
    };

    // ✅ 이전 previewUrl revoke를 setState 콜백 안에서 안전하게 처리
    const onDay0PhotoChange = (file: File | null) => {
        setDay0Photo((prev) => {
            if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);

            if (!file) {
                return { file: null, previewUrl: undefined, error: "파일을 선택하세요." };
            }

            const error = validatePhoto(file);
            if (error) {
                return { file: null, previewUrl: undefined, error };
            }

            const previewUrl = URL.createObjectURL(file);
            return { file, previewUrl, error: undefined };
        });
    };

    const completeCurrentStep = () => {
        if (isCompleted) return;
        if (!canCompleteCurrent) return;

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
        <div className="grid gap-6 lg:grid-cols-[520px_1fr]">
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
                        <h3 className="mt-1 text-lg font-semibold text-gray-900">{selected?.title}</h3>

                        {isCompleted ? (
                            <p className="mt-2 text-sm text-gray-500">이 단계는 이미 완료되었습니다. 다음 단계로 진행해 주세요.</p>
                        ) : activeIndex !== activeStepIndex ? (
                            <p className="mt-2 text-sm text-gray-500">
                                현재 진행중인 단계는 <span className="font-semibold text-gray-900">{BASE_STEPS[activeStepIndex]?.title}</span> 입니다.
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={completeCurrentStep}
                        disabled={!canCompleteCurrent}
                        className="h-10 shrink-0 rounded-xl bg-[#0064FF] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        title={
                            isCompleted
                                ? "이미 완료된 단계입니다."
                                : activeIndex !== activeStepIndex
                                    ? "진행중인 단계에서만 완료할 수 있습니다."
                                    : !allCheckedTodos
                                        ? "입양자 체크리스트 항목을 모두 체크하세요."
                                        : !allCheckedMedical
                                            ? "예방접종·의료 정보 항목을 모두 체크하세요."
                                            : needsDay0Photo && !day0PhotoOk
                                                ? "집 도착 사진을 업로드하세요."
                                                : "이 단계를 완료합니다."
                        }
                    >
                        {isCompleted ? "완료됨" : "이 단계 완료"}
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <section className="rounded-xl border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900">입양자 체크리스트</h4>

                        {activeIndex === 0 ? (
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-800">집 도착 사진 업로드</label>

                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <input
                                        type="file"
                                        accept={PHOTO_ACCEPT_TYPES}
                                        onChange={(e) => onDay0PhotoChange(e.target.files?.[0] ?? null)}
                                        className="block w-full max-w-[360px] text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                                        disabled={isCompleted || activeIndex !== activeStepIndex}
                                    />

                                    {day0Photo.previewUrl ? (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={day0Photo.previewUrl}
                                                alt="집 도착 사진 미리보기"
                                                className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                                            />
                                            <div className="text-xs text-gray-500">
                                                <div className="max-w-[220px] truncate">선택: {day0Photo.file?.name}</div>
                                                <div className="text-gray-400">* 업로드는 추후 백엔드 연동 예정</div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {day0Photo.error ? <p className="mt-2 text-xs text-red-600">{day0Photo.error}</p> : null}
                            </div>
                        ) : null}

                        <div className="mt-3 space-y-2">
                            {selected?.adopterTodos?.map((t, i) => {
                                const checked = selectedChecks[i] ?? false;
                                const disabled = isCompleted || activeIndex !== activeStepIndex;

                                return (
                                    <label
                                        key={t}
                                        className={`flex items-start gap-2 text-sm ${disabled ? "cursor-default text-gray-500" : "cursor-pointer text-gray-700"}`}
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

                        <div className="mt-3 space-y-2">
                            {selected?.medicalInfo?.map((t, i) => {
                                const checked = selectedMedicalChecks[i] ?? false;
                                const disabled = isCompleted || activeIndex !== activeStepIndex;

                                return (
                                    <label
                                        key={t}
                                        className={`flex items-start gap-2 text-sm ${disabled ? "cursor-default text-gray-500" : "cursor-pointer text-gray-700"}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1 h-4 w-4"
                                            checked={checked}
                                            disabled={disabled}
                                            onChange={() => toggleMedical(i)}
                                        />
                                        <span className={checked ? "line-through text-gray-400" : ""}>{t}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
