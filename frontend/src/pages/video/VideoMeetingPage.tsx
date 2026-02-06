import { useMemo } from "react";
import { useParams } from "react-router-dom";

export default function VideoMeetingPage() {
    const { postAdoptionId, stepOrder } = useParams();

    const title = useMemo(() => {
        if (stepOrder === "1") return "1차 화상 상담 진행";
        if (stepOrder === "2") return "2차 화상 상담 진행";
        if (stepOrder === "3") return "최종 화상 상담 진행";
        return "화상 상담 진행";
    }, [stepOrder]);

    return (
        <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
            <h1 className="text-2xl font-semibold">{title}</h1>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-gray-500">
                    WebRTC(OpenVidu) 연결 영역 (추후 구현)
                    <div className="mt-3 text-xs text-gray-400">
                        postAdoptionId: {postAdoptionId ?? "-"} / stepOrder:{" "}
                        {stepOrder ?? "-"}
                    </div>
                </div>
            </div>
        </section>
    );
}
