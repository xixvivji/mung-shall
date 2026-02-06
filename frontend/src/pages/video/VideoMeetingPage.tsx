import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/ui/button";

type StepKey = 30 | 60 | 90;

const STEPS: { stepKey: StepKey; title: string }[] = [
    { stepKey: 30, title: "1차 화상 상담 진행" },
    { stepKey: 60, title: "2차 화상 상담 진행" },
    { stepKey: 90, title: "최종 화상 상담 진행" },
];

function titleForStepKey(stepKey?: string) {
    const n = Number(stepKey);
    if (!Number.isNaN(n)) {
        if (n === 30) return "1차 화상 상담";
        if (n === 60) return "2차 화상 상담";
        if (n === 90) return "최종 화상 상담";
    }
    return "화상 상담";
}

function toStepKey(value?: string): StepKey | null {
    const n = Number(value);
    if (n === 30 || n === 60 || n === 90) return n;
    return null;
}

export default function VideoMeetingPage() {
    const navigate = useNavigate();
    const { postAdoptionId, stepKey: stepKeyParam } = useParams<{
        postAdoptionId: string;
        stepKey: string;
    }>();

    const pageTitle = useMemo(() => titleForStepKey(stepKeyParam), [stepKeyParam]);
    const currentStepKey = useMemo(() => toStepKey(stepKeyParam), [stepKeyParam]);

    const handleGo = (targetStepKey: StepKey) => {
        if (!postAdoptionId) return;
        navigate(`/video/${postAdoptionId}/${targetStepKey}`);
    };

    const handleStartTemp = (targetStepKey: StepKey) => {
        window.alert(`(${targetStepKey}) 여기에 OpenVidu 연결 로직이 들어갈 예정입니다.`);
    };

    return (
        <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">{pageTitle}</h1>

                <Link to="/mypage">
                    <Button variant="outline" className="rounded-lg">
                        마이페이지로 돌아가기
                    </Button>
                </Link>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm space-y-6">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div>
                        postAdoptionId:{" "}
                        <span className="font-semibold text-gray-900">{postAdoptionId ?? "-"}</span>
                    </div>
                    <div>
                        stepKey:{" "}
                        <span className="font-semibold text-gray-900">{stepKeyParam ?? "-"}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {STEPS.map((s) => {
                        const isCurrent = currentStepKey === s.stepKey;

                        return (
                            <div
                                key={s.stepKey}
                                className={`rounded-2xl border p-6 ${
                                    isCurrent ? "border-blue-200 bg-blue-50/30" : "border-gray-100 bg-white"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-semibold text-gray-900">{s.title}</h2>
                                        {isCurrent ? (
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        현재 단계
                      </span>
                                        ) : null}
                                    </div>

                                    <Button variant="outline" className="rounded-lg" onClick={() => handleGo(s.stepKey)}>
                                        입장 화면 보기
                                    </Button>
                                </div>

                                <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-600">
                                    WebRTC(OpenVidu) 연결 영역 (추후 구현)
                                </div>

                                <div className="mt-4 flex flex-col gap-2">
                                    <Button
                                        className="rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                                        onClick={() => handleStartTemp(s.stepKey)}
                                        disabled={!isCurrent}
                                    >
                                        화상 상담 시작(임시)
                                    </Button>

                                    {!isCurrent ? (
                                        <div className="text-xs text-gray-500">
                                            이 단계가 선택되면 시작할 수 있어요.
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-lg" onClick={() => window.history.back()}>
                        뒤로가기
                    </Button>
                </div>
            </div>
        </section>
    );
}
