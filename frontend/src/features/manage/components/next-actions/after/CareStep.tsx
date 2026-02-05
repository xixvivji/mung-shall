import { useMemo, useState } from "react";
import PostAdoptionStepper, { type StepperItem } from "@/shared/ui/uiverse/PostAdoptionStepper";

type RoadmapDetail = {
    title: string;
    adopterTodos: string[];
    medicalInfo: string[];
    platformFeatures: string[];
};

export function CareStep() {
    const [activeIndex, setActiveIndex] = useState(0);

    const steps = useMemo<StepperItem[]>(
        () => [
            { title: "입양 당일 체크", status: "active", time: "Day 0" },
            { title: "3일차 체크", status: "pending", time: "Day 3" },
            { title: "1주 적응", status: "pending", time: "Day 7" },
            { title: "2주 점검", status: "pending", time: "Day 14" },
            { title: "1개월 건강 체크", status: "pending", time: "Day 30" },
            { title: "2개월 체크", status: "pending", time: "Day 60" },
            { title: "3개월 마무리", status: "pending", time: "Day 90" },
        ],
        []
    );

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

    const selected = roadmap[activeIndex];

    const onPrev = () => setActiveIndex((v) => Math.max(0, v - 1));
    const onNext = () => setActiveIndex((v) => Math.min(steps.length - 1, v + 1));

    return (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            {/* 좌측: 스텝퍼 */}
            <div>
                <PostAdoptionStepper
                    steps={steps}
                    activeIndex={activeIndex}
                    onSelect={setActiveIndex}
                    onPrev={onPrev}
                    onNext={onNext}
                    prevLabel="이전"
                    nextLabel="다음"
                />
            </div>

            {/* 우측: 선택 단계 상세 패널 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-4">
                    <p className="text-sm text-gray-500">선택한 단계</p>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900">{selected.title}</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* 입양자 해야 할 것 */}
                    <section className="rounded-xl border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900">입양자 해야 할 것</h4>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                            {selected.adopterTodos.map((t) => (
                                <li key={t}>{t}</li>
                            ))}
                        </ul>
                    </section>

                    {/* 예방접종·의료 정보 */}
                    <section className="rounded-xl border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900">예방접종 · 의료 정보</h4>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                            {selected.medicalInfo.map((t) => (
                                <li key={t}>{t}</li>
                            ))}
                        </ul>
                    </section>

                    {/* 플랫폼 기능 */}
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
