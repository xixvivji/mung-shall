import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { GripVertical, Heart, X } from "lucide-react";
import imgFallback from "@/assets/images/7d7c0c4fb5f5ec351d4a2c2c80e08bf92b1c3de5.png";
import type { LikedDog } from "@/features/mypage/types";
import { fetchLikedDogs } from "@/features/mypage/api/mypageApi";

type Props = {
  onSubmitSuccess: () => void;
};

type LoadStatus = "loading" | "ok" | "unauthenticated" | "error";

export function SelectStep({ onSubmitSuccess }: Props) {
  const [favoriteDogs, setFavoriteDogs] = useState<LikedDog[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    fetchLikedDogs()
      .then((result) => {
        if (!mounted) return;
        setFavoriteDogs(result.items);
        setStatus(result.status);
      })
      .catch(() => {
        if (!mounted) return;
        setFavoriteDogs([]);
        setStatus("error");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const selectedDog = useMemo(
    () => favoriteDogs.find((dog) => dog.id === selectedDogId) ?? null,
    [favoriteDogs, selectedDogId]
  );

  const canSubmit = Boolean(selectedDogId);

  const onDragStartDog = (e: React.DragEvent<HTMLDivElement>, dogId: string) => {
    e.dataTransfer.setData("text/plain", dogId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOverDropzone = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const onDragLeaveDropzone = () => setIsDragOver(false);

  const onDropToDropzone = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    setSelectedDogId(id);
    setIsDragOver(false);
  };

  const clearSelection = () => setSelectedDogId(null);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">입양할 강아지 선택</h3>
          <p className="text-sm text-gray-500">
            카드를 드래그해서 위 칸에 끼워넣기 / 한 마리만 선택 가능
          </p>
        </div>

        <div className="mt-6">
          <div
            role="button"
            tabIndex={0}
            onDragOver={onDragOverDropzone}
            onDragLeave={onDragLeaveDropzone}
            onDrop={onDropToDropzone}
            className={[
              "relative mx-auto w-full max-w-[420px] rounded-2xl border-2 border-dashed p-5 transition",
              isDragOver ? "border-[#5f7cf7] bg-blue-50/40" : "border-gray-200 bg-gray-50",
              selectedDog ? "border-solid bg-white" : "",
            ].join(" ")}
            style={{
              boxShadow: selectedDog
                ? "0 10px 24px rgba(0,0,0,0.06)"
                : "inset 0 2px 6px rgba(0,0,0,0.08), inset 0 -2px 8px rgba(255,255,255,0.9)",
            }}
          >
            {!selectedDog ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                <div className="rounded-full bg-white p-3 shadow-sm">
                  <GripVertical className="text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  아래 카드에서 강아지를{" "}
                  <span className="text-gray-900">드래그</span>하거나{" "}
                  <span className="text-gray-900">클릭</span>해주세요.
                </p>
                <p className="text-xs text-gray-500">한 마리만 선택 가능합니다.</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <img
                  src={selectedDog.imageUrl || imgFallback}
                  alt={selectedDog.name}
                  className="h-24 w-32 rounded-xl object-cover"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-base font-semibold text-gray-900">{selectedDog.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedDog.breed ?? "-"} · {selectedDog.age ?? "-"}
                  </p>
                  <p className="text-xs text-gray-500">선택 완료! 제출할 준비가 되었어요.</p>
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

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-gray-600" />
            <p className="text-sm font-semibold text-gray-900">관심 등록한 강아지</p>
          </div>

          {status === "loading" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
              Loading...
            </div>
          )}

          {status === "unauthenticated" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
              로그인이 필요합니다.
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
              관심 목록을 불러오지 못했습니다.
            </div>
          )}

          {status === "ok" && favoriteDogs.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
              관심 등록한 강아지가 없습니다.
            </div>
          )}

          {status === "ok" && favoriteDogs.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteDogs.map((dog) => {
                const isSelected = dog.id === selectedDogId;
                return (
                  <div
                    key={dog.id}
                    role="button"
                    tabIndex={0}
                    draggable
                    onDragStart={(e) => onDragStartDog(e, dog.id)}
                    onClick={() => setSelectedDogId(dog.id)}
                    className={[
                      "group relative rounded-2xl border bg-white p-4 shadow-sm transition",
                      isSelected
                        ? "border-[#5f7cf7] ring-2 ring-[#5f7cf7]"
                        : "border-gray-200 hover:border-[#dbe5ff]",
                    ].join(" ")}
                  >
                    <div className="relative mb-3 w-full overflow-hidden rounded-xl bg-neutral-50 aspect-[4/3]">
                      <img
                        src={dog.imageUrl || imgFallback}
                        alt={dog.name}
                        className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{dog.name}</div>
                    <div className="text-xs text-[#666]">{dog.breed ?? "-"}</div>
                    <div className="text-xs text-[#999]">{dog.age ?? "-"}</div>
                    {dog.centerName ? (
                      <div className="mt-2 text-xs text-gray-400">{dog.centerName}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
