import PostAdoptionStepper from "@/shared/ui/uiverse/PostAdoptionStepper";

export function CareStep() {
  return (
    <PostAdoptionStepper
      steps={[
        { title: "입양 당일 체크", status: "completed", time: "완료" },
        { title: "1주 적응", status: "active", time: "진행 중" },
        { title: "1개월 건강 체크", status: "pending", time: "예정" },
      ]}
    />
  );
}
