import { useMemo, useState } from "react";
import PostAdoptionStepper, { type StepperItem } from "@/shared/ui/uiverse/PostAdoptionStepper";

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

    const onPrev = () => setActiveIndex((v) => Math.max(0, v - 1));
    const onNext = () => setActiveIndex((v) => Math.min(steps.length - 1, v + 1));

    return (
        <PostAdoptionStepper
            steps={steps}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            onPrev={onPrev}
            onNext={onNext}
            prevLabel="이전"
            nextLabel="다음"
        />
    );
}
