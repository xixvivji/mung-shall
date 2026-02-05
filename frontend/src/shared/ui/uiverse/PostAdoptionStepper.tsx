import { useMemo } from "react";
import "@/shared/styles/uiverse/PostAdoptionStepper.css";

const STEP_LABELS = [
    "입양 설문 작성",
    "입양 교육",
    "입양 상담",
    "개인서류 제출",
    "입양 신청서 작성",
    "입양 신청서 제출",
] as const;

export type AdoptionStepStatus =
    | "NOT_STARTED"
    | "PENDING"
    | "SUBMITTED"
    | "APPROVED"
    | "REJECTED";

type ResolvedStepState = "done" | "active" | "todo" | "rejected";

export type StepperItem = {
    status?: AdoptionStepStatus | null;
    time?: string;
};

type Props = {
    steps: StepperItem[];

    activeIndex?: number;
    onSelect?: (index: number) => void;

    onPrev?: () => void;
    onNext?: () => void;
    prevLabel?: string;
    nextLabel?: string;
    className?: string;
};

function resolveStepState(status?: AdoptionStepStatus | null): ResolvedStepState {
    if (status === "APPROVED") return "done";
    if (status === "PENDING" || status === "SUBMITTED") return "active";
    if (status === "REJECTED") return "rejected";
    return "todo"; // NOT_STARTED or undefined/null
}

function statusLabel(state: ResolvedStepState) {
    if (state === "done") return "Completed";
    if (state === "active") return "In Progress";
    if (state === "rejected") return "Rejected";
    return "Pending";
}

export default function PostAdoptionStepper({
                                                steps,
                                                activeIndex,
                                                onSelect,
                                                onPrev,
                                                onNext,
                                                prevLabel = "Previous",
                                                nextLabel = "Next",
                                                className,
                                            }: Props) {
    const canPrev = useMemo(() => Boolean(onPrev), [onPrev]);
    const canNext = useMemo(() => Boolean(onNext), [onNext]);

    const uiSteps = useMemo(
        () =>
            STEP_LABELS.map((title, idx) => {
                const backendStep = steps?.[idx];
                return {
                    title,
                    state: resolveStepState(backendStep?.status ?? "NOT_STARTED"),
                    time: backendStep?.time,
                };
            }),
        [steps]
    );

    return (
        <div className={`stepper-box ${className ?? ""}`}>
            {uiSteps.map((s, idx) => {
                const isDone = s.state === "done";
                const isActive = s.state === "active";
                const isRejected = s.state === "rejected";

                const stepClass = isDone
                    ? "stepper-step stepper-completed"
                    : isActive
                        ? "stepper-step stepper-active"
                        : isRejected
                            ? "stepper-step stepper-pending stepper-rejected"
                            : "stepper-step stepper-pending";

                const isSelected = activeIndex === idx;

                return (
                    <button
                        key={`${s.title}-${idx}`}
                        type="button"
                        className={`${stepClass} ${isSelected ? "stepper-selected" : ""}`}
                        onClick={() => onSelect?.(idx)}
                        style={{ textAlign: "left", width: "100%" }}
                    >
                        <div className="stepper-circle">
                            {isDone ? (
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
                            <div className="stepper-status">{statusLabel(s.state)}</div>
                            {s.time ? <div className="stepper-time">{s.time}</div> : null}
                        </div>
                    </button>
                );
            })}

            <div className="stepper-controls">
                <button
                    type="button"
                    className="stepper-button"
                    onClick={onPrev}
                    disabled={!canPrev}
                    aria-disabled={!canPrev}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-arrow-left"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                        />
                    </svg>
                    {prevLabel}
                </button>

                <button
                    type="button"
                    className="stepper-button stepper-button-primary"
                    onClick={onNext}
                    disabled={!canNext}
                    aria-disabled={!canNext}
                >
                    {nextLabel}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-arrow-right"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
