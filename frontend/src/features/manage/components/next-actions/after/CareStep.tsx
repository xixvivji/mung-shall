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

type SubmitStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED";

type EvidenceState = {
    file: File | null;
    previewUrl?: string;
    error?: string;
    status: SubmitStatus;
};

const MAX_EVIDENCE_MB = 10;

const WEEK1_EVIDENCE_ACCEPT_TYPES = ".pdf,.jpg,.jpeg,.png";
function validateWeek1Evidence(file: File): string | null {
    const maxBytes = MAX_EVIDENCE_MB * 1024 * 1024;
    if (file.size > maxBytes) return `파일 용량은 ${MAX_EVIDENCE_MB}MB 이하여야 합니다.`;

    const lower = file.name.toLowerCase();
    const okExt = [".pdf", ".jpg", ".jpeg", ".png"].some((ext) => lower.endsWith(ext));
    if (!okExt) return "PDF/JPG/PNG 파일만 업로드 가능합니다.";

    return null;
}

const PDF_ONLY_ACCEPT_TYPES = ".pdf";
function validatePdfOnlyEvidence(file: File): string | null {
    const maxBytes = MAX_EVIDENCE_MB * 1024 * 1024;
    if (file.size > maxBytes) return `파일 용량은 ${MAX_EVIDENCE_MB}MB 이하여야 합니다.`;

    const lower = file.name.toLowerCase();
    const okExt = [".pdf"].some((ext) => lower.endsWith(ext));
    if (!okExt) return "PDF 파일만 업로드 가능합니다.";

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
                medicalInfo: ["기존 예방접종 내역 확인", "중성화 여부 확인", "건강기록 인수", "접종 스케줄(2주 간격) 확인"],
            },
            {
                title: "3일차 체크 (Day 1–3)",
                adopterTodos: [
                    "휴식 공간 유지(환경 크게 바꾸지 않기)",
                    "식사·배변 기록 계속하기",
                    "산책은 짧게, 스트레스 신호 보이면 중단",
                    "배변 실수 줄어드는지 확인",
                ],
                medicalInfo: ["구토·설사·무기력 여부 관찰", "컨디션 변화 여부 관찰(식욕·활동량)"],
            },
            {
                title: "1주 적응 (Day 4–7)",
                adopterTodos: [
                    "집 루틴 만들기(식사-휴식-짧은 산책)",
                    "하네스 적응(간식으로 긍정 연결)",
                    "‘이름-시선’ 5분씩 연습",
                    "혼자 있는 연습 1–5분부터 시작",
                ],
                medicalInfo: ["다음 접종(2주 후) 일정 인지"],
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
                ],
                medicalInfo: [],
            },
            {
                title: "2개월 체크 (Day 60)",
                adopterTodos: ["산책·훈련 루틴 유지 확인", "혼자 있는 시간 10–30분 유지", "문제 행동 발생 여부 점검"],
                medicalInfo: ["외부 활동 안정 여부 점검"],
            },
            {
                title: "3개월 마무리 (Day 90)",
                adopterTodos: ["최종 후기 작성", "입양 확정 동의", "분리·자극 상황에서 안정 여부 확인"],
                medicalInfo: ["연간 예방접종 스케줄 안내 확인"],
            },
        ],
        []
    );

    const [day0Photo, setDay0Photo] = useState<{ file: File | null; previewUrl?: string; error?: string }>({ file: null });

    useEffect(() => {
        return () => {
            if (day0Photo.previewUrl) URL.revokeObjectURL(day0Photo.previewUrl);
        };
    }, [day0Photo.previewUrl]);

    const [week1Evidence, setWeek1Evidence] = useState<EvidenceState>({
        file: null,
        previewUrl: undefined,
        error: undefined,
        status: "NOT_SUBMITTED",
    });

    useEffect(() => {
        return () => {
            if (week1Evidence.previewUrl) URL.revokeObjectURL(week1Evidence.previewUrl);
        };
    }, [week1Evidence.previewUrl]);

    const [day30Vaccine3Evidence, setDay30Vaccine3Evidence] = useState<EvidenceState>({
        file: null,
        previewUrl: undefined,
        error: undefined,
        status: "NOT_SUBMITTED",
    });

    useEffect(() => {
        return () => {
            if (day30Vaccine3Evidence.previewUrl) URL.revokeObjectURL(day30Vaccine3Evidence.previewUrl);
        };
    }, [day30Vaccine3Evidence.previewUrl]);

    const [day30ParasiteEvidence, setDay30ParasiteEvidence] = useState<EvidenceState>({
        file: null,
        previewUrl: undefined,
        error: undefined,
        status: "NOT_SUBMITTED",
    });

    useEffect(() => {
        return () => {
            if (day30ParasiteEvidence.previewUrl) URL.revokeObjectURL(day30ParasiteEvidence.previewUrl);
        };
    }, [day30ParasiteEvidence.previewUrl]);

    const [day60Vaccine4KennelEvidence, setDay60Vaccine4KennelEvidence] = useState<EvidenceState>({
        file: null,
        previewUrl: undefined,
        error: undefined,
        status: "NOT_SUBMITTED",
    });

    useEffect(() => {
        return () => {
            if (day60Vaccine4KennelEvidence.previewUrl) URL.revokeObjectURL(day60Vaccine4KennelEvidence.previewUrl);
        };
    }, [day60Vaccine4KennelEvidence.previewUrl]);

    const [day90RabiesEvidence, setDay90RabiesEvidence] = useState<EvidenceState>({
        file: null,
        previewUrl: undefined,
        error: undefined,
        status: "NOT_SUBMITTED",
    });

    useEffect(() => {
        return () => {
            if (day90RabiesEvidence.previewUrl) URL.revokeObjectURL(day90RabiesEvidence.previewUrl);
        };
    }, [day90RabiesEvidence.previewUrl]);

    const [checklist, setChecklist] = useState<ChecklistState>(() => {
        const init: ChecklistState = {};
        roadmap.forEach((r, idx) => {
            init[idx] = new Array(r.adopterTodos.length).fill(false);
        });
        return init;
    });

    const [medicalChecklist, setMedicalChecklist] = useState<MedicalChecklistState>(() => {
        const init: MedicalChecklistState = {};
        roadmap.forEach((r, idx) => {
            init[idx] = new Array(r.medicalInfo.length).fill(false);
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
            const status: CareUiStatus = completedSet.has(idx) ? "completed" : idx === activeStepIndex ? "active" : "pending";
            return { ...s, status };
        });
    }, [completedSet, activeStepIndex]);

    const selected = roadmap[activeIndex];
    const isCompleted = completedSet.has(activeIndex);

    const selectedChecks = checklist[activeIndex] ?? [];
    const selectedMedicalChecks = medicalChecklist[activeIndex] ?? [];

    const allCheckedTodos = selectedChecks.length > 0 && selectedChecks.every(Boolean);
    const allCheckedMedical = selectedMedicalChecks.length === 0 || selectedMedicalChecks.every(Boolean);

    const needsDay0Photo = activeIndex === 0;
    const day0PhotoOk = !needsDay0Photo || !!day0Photo.file;

    const needsWeek1Evidence = activeIndex === 2;
    const week1EvidenceOk = !needsWeek1Evidence || week1Evidence.status === "PENDING" || week1Evidence.status === "APPROVED";

    const needsDay30Evidence = activeIndex === 4;
    const day30VaccineOk = day30Vaccine3Evidence.status === "PENDING" || day30Vaccine3Evidence.status === "APPROVED";
    const day30ParasiteOk = day30ParasiteEvidence.status === "PENDING" || day30ParasiteEvidence.status === "APPROVED";
    const day30EvidenceOk = !needsDay30Evidence || (day30VaccineOk && day30ParasiteOk);

    const needsDay60Evidence = activeIndex === 5;
    const day60Ok = day60Vaccine4KennelEvidence.status === "PENDING" || day60Vaccine4KennelEvidence.status === "APPROVED";
    const day60EvidenceOk = !needsDay60Evidence || day60Ok;

    const needsDay90Evidence = activeIndex === 6;
    const day90Ok = day90RabiesEvidence.status === "PENDING" || day90RabiesEvidence.status === "APPROVED";
    const day90EvidenceOk = !needsDay90Evidence || day90Ok;

    const canCompleteCurrent =
        !isCompleted &&
        activeIndex === activeStepIndex &&
        allCheckedTodos &&
        allCheckedMedical &&
        day0PhotoOk &&
        week1EvidenceOk &&
        day30EvidenceOk &&
        day60EvidenceOk &&
        day90EvidenceOk;

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

    const onDay0PhotoChange = (file: File | null) => {
        if (day0Photo.previewUrl) URL.revokeObjectURL(day0Photo.previewUrl);

        if (!file) {
            setDay0Photo({ file: null, previewUrl: undefined, error: "파일을 선택하세요." });
            return;
        }

        const error = validatePhoto(file);
        if (error) {
            setDay0Photo({ file: null, previewUrl: undefined, error });
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setDay0Photo({ file, previewUrl, error: undefined });
    };

    const onWeek1EvidenceChange = (file: File | null) => {
        if (week1Evidence.previewUrl) URL.revokeObjectURL(week1Evidence.previewUrl);

        if (!file) {
            setWeek1Evidence((prev) => ({ ...prev, file: null, previewUrl: undefined, error: "파일을 선택하세요." }));
            return;
        }

        const error = validateWeek1Evidence(file);
        if (error) {
            setWeek1Evidence((prev) => ({ ...prev, file: null, previewUrl: undefined, error, status: "NOT_SUBMITTED" }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setWeek1Evidence((prev) => ({ ...prev, file, previewUrl, error: undefined, status: "NOT_SUBMITTED" }));
    };

    const submitWeek1Evidence = () => {
        if (!week1Evidence.file) {
            setWeek1Evidence((prev) => ({ ...prev, error: "파일을 첨부한 뒤 제출해 주세요." }));
            return;
        }
        setWeek1Evidence((prev) => ({ ...prev, status: "PENDING", error: undefined }));
    };

    const onDay30VaccineChange = (file: File | null) => {
        if (day30Vaccine3Evidence.previewUrl) URL.revokeObjectURL(day30Vaccine3Evidence.previewUrl);

        if (!file) {
            setDay30Vaccine3Evidence((prev) => ({ ...prev, file: null, previewUrl: undefined, error: "파일을 선택하세요." }));
            return;
        }

        const error = validatePdfOnlyEvidence(file);
        if (error) {
            setDay30Vaccine3Evidence((prev) => ({ ...prev, file: null, previewUrl: undefined, error, status: "NOT_SUBMITTED" }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setDay30Vaccine3Evidence((prev) => ({ ...prev, file, previewUrl, error: undefined, status: "NOT_SUBMITTED" }));
    };

    const submitDay30Vaccine = () => {
        if (!day30Vaccine3Evidence.file) {
            setDay30Vaccine3Evidence((prev) => ({ ...prev, error: "파일을 첨부한 뒤 제출해 주세요." }));
            return;
        }
        setDay30Vaccine3Evidence((prev) => ({ ...prev, status: "PENDING", error: undefined }));
    };

    const onDay30ParasiteChange = (file: File | null) => {
        if (day30ParasiteEvidence.previewUrl) URL.revokeObjectURL(day30ParasiteEvidence.previewUrl);

        if (!file) {
            setDay30ParasiteEvidence((prev) => ({ ...prev, file: null, previewUrl: undefined, error: "파일을 선택하세요." }));
            return;
        }

        const error = validatePdfOnlyEvidence(file);
        if (error) {
            setDay30ParasiteEvidence((prev) => ({ ...prev, file: null, previewUrl: undefined, error, status: "NOT_SUBMITTED" }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setDay30ParasiteEvidence((prev) => ({ ...prev, file, previewUrl, error: undefined, status: "NOT_SUBMITTED" }));
    };

    const submitDay30Parasite = () => {
        if (!day30ParasiteEvidence.file) {
            setDay30ParasiteEvidence((prev) => ({ ...prev, error: "파일을 첨부한 뒤 제출해 주세요." }));
            return;
        }
        setDay30ParasiteEvidence((prev) => ({ ...prev, status: "PENDING", error: undefined }));
    };

    const onDay60EvidenceChange = (file: File | null) => {
        if (day60Vaccine4KennelEvidence.previewUrl) URL.revokeObjectURL(day60Vaccine4KennelEvidence.previewUrl);

        if (!file) {
            setDay60Vaccine4KennelEvidence((prev) => ({ ...prev, file: null, previewUrl: undefined, error: "파일을 선택하세요." }));
            return;
        }

        const error = validatePdfOnlyEvidence(file);
        if (error) {
            setDay60Vaccine4KennelEvidence((prev) => ({ ...prev, file: null, previewUrl: undefined, error, status: "NOT_SUBMITTED" }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setDay60Vaccine4KennelEvidence((prev) => ({ ...prev, file, previewUrl, error: undefined, status: "NOT_SUBMITTED" }));
    };

    const submitDay60Evidence = () => {
        if (!day60Vaccine4KennelEvidence.file) {
            setDay60Vaccine4KennelEvidence((prev) => ({ ...prev, error: "파일을 첨부한 뒤 제출해 주세요." }));
            return;
        }
        setDay60Vaccine4KennelEvidence((prev) => ({ ...prev, status: "PENDING", error: undefined }));
    };

    const onDay90EvidenceChange = (file: File | null) => {
        if (day90RabiesEvidence.previewUrl) URL.revokeObjectURL(day90RabiesEvidence.previewUrl);

        if (!file) {
            setDay90RabiesEvidence((prev) => ({ ...prev, file: null, previewUrl: undefined, error: "파일을 선택하세요." }));
            return;
        }

        const error = validatePdfOnlyEvidence(file);
        if (error) {
            setDay90RabiesEvidence((prev) => ({ ...prev, file: null, previewUrl: undefined, error, status: "NOT_SUBMITTED" }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setDay90RabiesEvidence((prev) => ({ ...prev, file, previewUrl, error: undefined, status: "NOT_SUBMITTED" }));
    };

    const submitDay90Evidence = () => {
        if (!day90RabiesEvidence.file) {
            setDay90RabiesEvidence((prev) => ({ ...prev, error: "파일을 첨부한 뒤 제출해 주세요." }));
            return;
        }
        setDay90RabiesEvidence((prev) => ({ ...prev, status: "PENDING", error: undefined }));
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

    const isActiveStep = activeIndex === activeStepIndex;

    const evidenceBadge = (status: SubmitStatus) => {
        if (status === "PENDING") return <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 whitespace-nowrap">기관 확인중</span>;
        if (status === "APPROVED") return <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 whitespace-nowrap">승인 완료</span>;
        return <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 whitespace-nowrap">미제출</span>;
    };

    const PdfEvidenceBlock = (props: {
        title: string;
        desc: string;
        state: EvidenceState;
        onChange: (file: File | null) => void;
        onSubmit: () => void;
    }) => {
        const disabledUpload = isCompleted || !isActiveStep || props.state.status === "PENDING";
        const disabledSubmit = isCompleted || !isActiveStep || props.state.status === "PENDING";

        return (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{props.title}</p>
                        <p className="mt-1 text-xs text-gray-500">{props.desc}</p>
                    </div>
                    <div className="text-xs font-semibold">{evidenceBadge(props.state.status)}</div>
                </div>

                <div className="mt-3">
                    <input
                        type="file"
                        accept={PDF_ONLY_ACCEPT_TYPES}
                        onChange={(e) => props.onChange(e.target.files?.[0] ?? null)}
                        className="block w-full max-w-[420px] text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
                        disabled={disabledUpload}
                    />

                    {props.state.file ? (
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs text-gray-500">PDF</div>
                            <div className="min-w-0">
                                <div className="text-xs text-gray-600">선택: {props.state.file.name}</div>
                                <div className="text-xs text-gray-400">* 제출 시 “기관 확인중”으로 표시됩니다.</div>
                            </div>
                        </div>
                    ) : null}

                    {props.state.error ? <p className="mt-2 text-xs text-red-600">{props.state.error}</p> : null}

                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={props.onSubmit}
                            disabled={disabledSubmit}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title={props.state.status === "PENDING" ? "기관 확인중입니다." : "PDF 증빙을 제출합니다."}
                        >
                            {props.state.status === "PENDING" ? "기관 확인중" : "제출하기"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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
                                    <svg viewBox="0 0 16 16" className="bi bi-check-lg" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
                    <button type="button" className="stepper-button stepper-button-primary" onClick={onNext} disabled={activeIndex === stepStates.length - 1}>
                        다음
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-gray-500">선택한 단계</p>
                        <h3 className="mt-1 text-lg font-semibold text-gray-900">{selected.title}</h3>
                        {isCompleted ? <p className="mt-2 text-sm text-gray-500">이 단계는 이미 완료되었습니다. 다음 단계로 진행해 주세요.</p> : null}
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
                                                : needsWeek1Evidence && !week1EvidenceOk
                                                    ? "접종 증빙 서류를 제출해 주세요."
                                                    : needsDay30Evidence && !day30EvidenceOk
                                                        ? "Day 30 증빙(PDF) 2개를 제출해 주세요."
                                                        : needsDay60Evidence && !day60EvidenceOk
                                                            ? "Day 60 증빙(PDF)을 제출해 주세요."
                                                            : needsDay90Evidence && !day90EvidenceOk
                                                                ? "Day 90 증빙(PDF)을 제출해 주세요."
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
                                        disabled={isCompleted || !isActiveStep}
                                    />

                                    {day0Photo.previewUrl ? (
                                        <div className="flex items-center gap-3">
                                            <img src={day0Photo.previewUrl} alt="집 도착 사진 미리보기" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
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
                            {selected.adopterTodos.map((t, i) => {
                                const checked = selectedChecks[i] ?? false;
                                const disabled = isCompleted || !isActiveStep;

                                return (
                                    <label key={t} className={`flex items-start gap-2 text-sm ${disabled ? "cursor-default text-gray-500" : "cursor-pointer text-gray-700"}`}>
                                        <input type="checkbox" className="mt-1 h-4 w-4" checked={checked} disabled={disabled} onChange={() => toggleTodo(i)} />
                                        <span className={checked ? "line-through text-gray-400" : ""}>{t}</span>
                                    </label>
                                );
                            })}
                        </div>

                        <p className="mt-4 text-xs text-gray-400">* 진행중인 단계에서 체크/완료가 가능합니다.</p>
                    </section>

                    <section className="rounded-xl border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900">예방접종 · 의료 정보</h4>

                        {selected.medicalInfo.length > 0 ? (
                            <div className="mt-3 space-y-2">
                                {selected.medicalInfo.map((t, i) => {
                                    const checked = selectedMedicalChecks[i] ?? false;
                                    const disabled = isCompleted || !isActiveStep;

                                    return (
                                        <label key={t} className={`flex items-start gap-2 text-sm ${disabled ? "cursor-default text-gray-500" : "cursor-pointer text-gray-700"}`}>
                                            <input type="checkbox" className="mt-1 h-4 w-4" checked={checked} disabled={disabled} onChange={() => toggleMedical(i)} />
                                            <span className={checked ? "line-through text-gray-400" : ""}>{t}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : null}

                        {activeIndex === 2 ? (
                            <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">종합백신 1차 / 코로나장염 1차 증빙</p>
                                        <p className="mt-1 text-xs text-gray-500">접종 확인서(병원 발급) 또는 접종 스티커 사진을 업로드해 주세요.</p>
                                    </div>
                                    <div className="text-xs font-semibold">{evidenceBadge(week1Evidence.status)}</div>
                                </div>

                                <div className="mt-3">
                                    <input
                                        type="file"
                                        accept={WEEK1_EVIDENCE_ACCEPT_TYPES}
                                        onChange={(e) => onWeek1EvidenceChange(e.target.files?.[0] ?? null)}
                                        className="block w-full max-w-[420px] text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
                                        disabled={isCompleted || !isActiveStep || week1Evidence.status === "PENDING"}
                                    />

                                    {week1Evidence.file ? (
                                        <div className="mt-3 flex items-center gap-3">
                                            {week1Evidence.previewUrl && week1Evidence.file.type !== "application/pdf" ? (
                                                <img src={week1Evidence.previewUrl} alt="접종 증빙 미리보기" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
                                            ) : (
                                                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs text-gray-500">PDF</div>
                                            )}

                                            <div className="min-w-0">
                                                <div className="text-xs text-gray-600">선택: {week1Evidence.file.name}</div>
                                                <div className="text-xs text-gray-400">* 제출 시 “기관 확인중”으로 표시됩니다.</div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {week1Evidence.error ? <p className="mt-2 text-xs text-red-600">{week1Evidence.error}</p> : null}

                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={submitWeek1Evidence}
                                            disabled={isCompleted || !isActiveStep || week1Evidence.status === "PENDING"}
                                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {week1Evidence.status === "PENDING" ? "기관 확인중" : "제출하기"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {activeIndex === 4 ? (
                            <div className="mt-5 space-y-4">
                                {PdfEvidenceBlock({
                                    title: "종합백신 3차 접종 여부 확인 (PDF 증빙)",
                                    desc: "접종 확인서(PDF)를 업로드 후 제출해 주세요.",
                                    state: day30Vaccine3Evidence,
                                    onChange: onDay30VaccineChange,
                                    onSubmit: submitDay30Vaccine,
                                })}
                                {PdfEvidenceBlock({
                                    title: "심장사상충 · 외부기생충 예방 여부 체크 (PDF 증빙)",
                                    desc: "예방 내역 확인서(PDF)를 업로드 후 제출해 주세요.",
                                    state: day30ParasiteEvidence,
                                    onChange: onDay30ParasiteChange,
                                    onSubmit: submitDay30Parasite,
                                })}
                            </div>
                        ) : null}

                        {activeIndex === 5 ? (
                            <div className="mt-5">
                                {PdfEvidenceBlock({
                                    title: "종합백신 4차 + 켄넬코프 접종 여부 확인 (PDF 증빙)",
                                    desc: "접종 확인서(PDF)를 업로드 후 제출해 주세요.",
                                    state: day60Vaccine4KennelEvidence,
                                    onChange: onDay60EvidenceChange,
                                    onSubmit: submitDay60Evidence,
                                })}
                            </div>
                        ) : null}

                        {activeIndex === 6 ? (
                            <div className="mt-5">
                                {PdfEvidenceBlock({
                                    title: "광견병 예방접종 여부 확인 (PDF 증빙)",
                                    desc: "접종 확인서(PDF)를 업로드 후 제출해 주세요.",
                                    state: day90RabiesEvidence,
                                    onChange: onDay90EvidenceChange,
                                    onSubmit: submitDay90Evidence,
                                })}
                            </div>
                        ) : null}
                    </section>

                    {activeIndex === 4 ? (
                        <section className="rounded-xl border border-gray-200 p-4">
                            <h4 className="text-sm font-semibold text-gray-900">1차 화상 상담 진행</h4>
                            <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                WebRTC(OpenVidu) 연결 영역 (추후 구현)
                            </div>
                        </section>
                    ) : null}

                    {activeIndex === 5 ? (
                        <section className="rounded-xl border border-gray-200 p-4">
                            <h4 className="text-sm font-semibold text-gray-900">2차 화상 상담 진행</h4>
                            <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                WebRTC(OpenVidu) 연결 영역 (추후 구현)
                            </div>
                        </section>
                    ) : null}

                    {activeIndex === 6 ? (
                        <section className="rounded-xl border border-gray-200 p-4">
                            <h4 className="text-sm font-semibold text-gray-900">최종 화상 상담 진행</h4>
                            <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                WebRTC(OpenVidu) 연결 영역 (추후 구현)
                            </div>
                        </section>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
