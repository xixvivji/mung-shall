// src/features/mypage/components/next-actions/before/SelectStep.tsx
import { useMemo, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { X, GripVertical, Heart } from "lucide-react";

import DogCard from "@/features/adoption/components/DogCard";
import imgFallback from "@/assets/images/7d7c0c4fb5f5ec351d4a2c2c80e08bf92b1c3de5.png";
import type { AdoptionDog } from "@/features/adoption/types";

type Props = {
  /** 제출 완료 시 다음 단계로 이동 */
  onSubmitSuccess: () => void;
};

/** ✅ 프론트-only: “관심 등록한 강아지” 더미 */
const FAVORITE_DOGS: AdoptionDog[] = [
  { id: 1, name: "초코", age: "2살", breed: "믹스", imageUrl: "https://placedog.net/400/300?id=11" } as AdoptionDog,
  { id: 2, name: "보리", age: "1살", breed: "푸들", imageUrl: "https://placedog.net/400/300?id=12" } as AdoptionDog,
  { id: 3, name: "콩이", age: "3살", breed: "시바견", imageUrl: "https://placedog.net/400/300?id=13" } as AdoptionDog,
  { id: 4, name: "두부", age: "4살", breed: "진도 믹스", imageUrl: "https://placedog.net/400/300?id=14" } as AdoptionDog,
];

export function SelectStep({ onSubmitSuccess }: Props) {
  // ✅ 목록을 state로: 드롭 후 “배치됨” 표현 가능
  const [favoriteDogs, setFavoriteDogs] = useState<AdoptionDog[]>(FAVORITE_DOGS);

  const [selectedDogId, setSelectedDogId] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // ✅ 드래그 프리뷰(ghost)용 ref 저장
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const selectedDog = useMemo(
    () => favoriteDogs.find((d) => d.id === selectedDogId) ?? null,
    [favoriteDogs, selectedDogId]
  );

  // ⚠️ 드롭 후에는 목록에서 제거되므로, 선택된 강아지는 따로 찾을 수 있게 백업
  const selectedDogBackup = useMemo(() => {
    if (selectedDog) return selectedDog;
    if (selectedDogId == null) return null;
    // 이미 목록에서 빠졌을 수 있으니 원본 더미에서도 찾기
    return FAVORITE_DOGS.find((d) => d.id === selectedDogId) ?? null;
  }, [selectedDog, selectedDogId]);

  const canSubmit = selectedDogId !== null;

  function setDragPreview(e: React.DragEvent, dogId: number) {
    const el = cardRefs.current[dogId];
    if (!el) return;

    // ✅ 카드 DOM 복제 → drag image로 사용
    const clone = el.cloneNode(true) as HTMLDivElement;
    clone.style.position = "absolute";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.width = `${el.getBoundingClientRect().width}px`;
    clone.style.pointerEvents = "none";
    clone.style.transform = "rotate(-2deg) scale(1.02)";
    clone.style.boxShadow = "0 18px 40px rgba(0,0,0,0.18)";
    clone.style.borderRadius = "16px";
    document.body.appendChild(clone);

    // 마우스가 카드 가운데쯤 잡히는 느낌
    const rect = el.getBoundingClientRect();
    const offsetX = Math.min(80, rect.width / 3);
    const offsetY = Math.min(60, rect.height / 3);
    e.dataTransfer.setDragImage(clone, offsetX, offsetY);

    // 프레임 이후 제거 (drag 시작엔 이미 반영됨)
    requestAnimationFrame(() => {
      document.body.removeChild(clone);
    });
  }

  function onDragStartDog(e: React.DragEvent<HTMLDivElement>, dogId: number) {
    e.dataTransfer.setData("text/plain", String(dogId));
    e.dataTransfer.effectAllowed = "move";

    // ✅ “진짜 잡고 움직이는 느낌” = 카드 자체를 drag image로
    setDragPreview(e, dogId);
  }

  function onDragOverDropzone(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }

  function onDragLeaveDropzone() {
    setIsDragOver(false);
  }

  function onDropToDropzone(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");
    const id = Number(raw);
    if (!Number.isFinite(id)) return;

    // ✅ 이미 하나 선택돼 있으면 교체 로직(원하면 막아도 됨)
    // 여기서는 “교체”로 처리: 기존 선택을 목록으로 돌려놓고 새 선택을 배치
    setFavoriteDogs((prev) => {
      const next = [...prev];

      // 기존 선택이 있었고 목록에 없다면 다시 넣어줌
      if (selectedDogId !== null && !next.some((d) => d.id === selectedDogId)) {
        const back = FAVORITE_DOGS.find((d) => d.id === selectedDogId);
        if (back) next.unshift(back);
      }

      // 새로 선택한 애는 목록에서 제거(배치된 느낌)
      return next.filter((d) => d.id !== id);
    });

    setSelectedDogId(id);
    setIsDragOver(false);
  }

  function clearSelection() {
    if (selectedDogId == null) return;

    // ✅ 선택 취소하면 다시 목록으로 복귀
    const back = FAVORITE_DOGS.find((d) => d.id === selectedDogId);
    if (back) {
      setFavoriteDogs((prev) => {
        if (prev.some((d) => d.id === back.id)) return prev;
        return [back, ...prev];
      });
    }

    setSelectedDogId(null);
  }

  const placedDog = selectedDogBackup;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        {/* 상단 설명 */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">입양할 강아지 선택</h3>
          <p className="text-sm text-gray-500">함께할 강아지 한 마리를 선택해주세요.</p>
        </div>

        {/* ✅ 드롭존 */}
        <div className="mt-6">
          <div
            role="button"
            tabIndex={0}
            onDragOver={onDragOverDropzone}
            onDragLeave={onDragLeaveDropzone}
            onDrop={onDropToDropzone}
            className={[
              "relative mx-auto w-full max-w-[350px] rounded-2xl border-2 border-dashed p-5 transition",
              isDragOver ? "border-[#5f7cf7] bg-blue-50/40" : "border-gray-200 bg-gray-50",
              placedDog ? "border-solid bg-white" : "",
            ].join(" ")}
            style={{
              boxShadow: placedDog
                ? "0 10px 24px rgba(0,0,0,0.06)"
                : "inset 0 2px 6px rgba(0,0,0,0.08), inset 0 -2px 8px rgba(255,255,255,0.9)",
            }}
          >
            {!placedDog ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                <div className="rounded-full bg-white p-3 shadow-sm">
                  <GripVertical className="text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  아래 카드에서 강아지를 <span className="text-gray-900">드래그</span>해서 이 칸에{" "}
                  <span className="text-gray-900">끼워넣기</span>
                </p>
                <p className="text-xs text-gray-500">한 마리만 선택할 수 있어요.</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <img
                  src={(placedDog.imageUrl as string) || imgFallback}
                  alt={placedDog.name}
                  className="h-24 w-32 rounded-xl object-cover"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-base font-semibold text-gray-900">{placedDog.name}</p>
                  <p className="text-sm text-gray-600">
                    {placedDog.breed} · {placedDog.age}
                  </p>
                  <p className="text-xs text-gray-500">선택 완료! 제출할 수 있어요.</p>
                </div>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"
                  aria-label="선택 취소"
                  title="선택 취소"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ 관심 등록 목록 */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-gray-600" />
            <p className="text-sm font-semibold text-gray-900">관심 등록한 강아지</p>
            <p className="text-xs text-gray-500">(카드를 드래그해서 위 칸에 끼워주세요)</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteDogs.map((dog) => (
              <div
                key={dog.id}
                ref={(el) => {
                  cardRefs.current[dog.id] = el;
                }}
                className="relative"
                draggable
                onDragStart={(e) => onDragStartDog(e, dog.id)}
              >
                {/* DogCard 자체에 draggable 전달해도 되지만,
                    여기서는 wrapper가 draggable이 되도록 해서 drag image용 ref와 일치시킴 */}
                <DogCard dog={dog} variant="div" selected={dog.id === selectedDogId} className="relative" />
              </div>
            ))}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="mt-8 flex justify-end">
          <Button
            disabled={!canSubmit}
            onClick={onSubmitSuccess}
            className={[
              "rounded-md bg-[#0064FF] hover:bg-[#0056E6]",
              canSubmit ? "bg-[#5f7cf7] text-white" : "cursor-not-allowed bg-gray-300 text-gray-500",
            ].join(" ")}
          >
            입양하기
          </Button>
        </div>
      </div>
    </div>
  );
}
