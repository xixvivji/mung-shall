import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/shared/ui/button";

function titleForStepKey(stepKey?: string) {
    const n = Number(stepKey);
    if (!Number.isNaN(n)) {
        if (n === 30) return "1차 화상 상담";
        if (n === 60) return "2차 화상 상담";
        if (n === 90) return "최종 화상 상담";
    }
    return "화상 상담";
}

export default function VideoMeetingPage() {
    const { postAdoptionId, stepKey } = useParams<{
        postAdoptionId: string;
        stepKey: string;
    }>();

    const title = useMemo(() => titleForStepKey(stepKey), [stepKey]);

    return (
        <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">{title}</h1>

                <Link to="/mypage">
                    <Button variant="outline" className="rounded-lg">
                        마이페이지로 돌아가기
                    </Button>
                </Link>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm space-y-4">
                <div className="text-sm text-gray-600">
                    postAdoptionId: <span className="font-semibold">{postAdoptionId ?? "-"}</span>
                </div>
                <div className="text-sm text-gray-600">
                    stepKey: <span className="font-semibold">{stepKey ?? "-"}</span>
                </div>

                <div className="mt-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-gray-600">
                    WebRTC(OpenVidu) 연결 영역 (추후 구현)
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        className="rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => window.alert("여기에 OpenVidu 연결 로직이 들어갈 예정입니다.")}
                    >
                        화상 상담 시작(임시)
                    </Button>

                    <Button variant="outline" className="rounded-lg" onClick={() => window.history.back()}>
                        뒤로가기
                    </Button>
                </div>
            </div>
        </section>
    );
}
