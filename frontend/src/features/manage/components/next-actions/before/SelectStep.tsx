import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { GripVertical, Heart, X } from "lucide-react";
import imgFallback from "@/assets/images/7d7c0c4fb5f5ec351d4a2c2c80e08bf92b1c3de5.png";

import type { LikedDog } from "@/features/manage/types";
import { fetchLikedDogs, fetchAdoptionsByStatus } from "@/features/manage/api/manageApi";
import { startAdoption } from "@/features/adoption/api/adoptionApi";

import useAuth from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/shared/constants/routes";
import { ApiError } from "@/shared/api/client";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import AlertModal from "@/shared/components/AlertModal";

type Props = {
  onSubmitSuccess?: () => void;
  onAdopt?: (dog: LikedDog) => Promise<void>;
};

type LoadStatus = "loading" | "ok" | "unauthenticated" | "error";

export function SelectStep({ onSubmitSuccess, onAdopt }: Props) {
  const [favoriteDogs, setFavoriteDogs] = useState<LikedDog[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openAlert, alertProps } = useAlertModal();

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

  const canSubmit = Boolean(selectedDogId) && !isSubmitting;

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

  const resolveUserId = () => {
    // 프로젝트에서 user 구조가 userId / id 섞여있어서 안전하게 처리
    const u = user as unknown as { userId?: number; id?: number } | null;
    if (typeof u?.userId === "number") return u.userId;
    if (typeof u?.id === "number") return u.id;
    return null;
  };

  const handleSubmit = async () => {
    if (!selectedDogId) return;

    // 로그인 체크
    if (!user) {
      openAlert({ title: "로그인 필요", message: "입양을 진행하려면 로그인이 필요합니다." });
      navigate(ROUTES.login, { state: { from: location.pathname } });
      return;
    }

    // ✅ liked dog의 id(string) = abandonedDogId 로 사용
    const abandonedDogId = Number(selectedDogId);
    if (!Number.isFinite(abandonedDogId)) {
      openAlert({ title: "입양 신청 실패", message: "유효하지 않은 abandonedDogId 입니다." });
      return;
    }

    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (onAdopt && selectedDog) {
        await onAdopt(selectedDog);
        onSubmitSuccess?.();
        return;
      }

      // ✅ Swagger: POST /api/adoptions body { abandonedDogId }
      const { adoptionId } = await startAdoption({ abandonedDogId });

      // ✅ 입양관리로 이동 (원하면 /adoptions/${adoptionId}로 바꿔도 됨)
      navigate(`${ROUTES.manage}?adoptionId=${adoptionId}&dogId=${abandonedDogId}`);
      onSubmitSuccess?.();
    } catch (err) {
      // ✅ 이미 진행중(400)일 때: IN_PROGRESS 목록에서 "클릭한 강아지"로 정확히 매칭
      if (err instanceof ApiError && err.status === 400) {
        const shouldMove = window.confirm("이미 진행 중인 입양입니다. 입양 관리로 이동할까요?");
        if (!shouldMove) return;

        const userId = resolveUserId();
        try {
          if (typeof userId === "number") {
            const existing = await fetchAdoptionsByStatus(userId, ["IN_PROGRESS"]);

            // ⭐ 핵심: 클릭한 강아지(dogId/abandonedDogId)로 매칭해야 함
            const matched = existing.find((a) => a.dogId === abandonedDogId);

            const resolvedAdoptionId =
              typeof matched?.adoptionId === "number" && Number.isFinite(matched.adoptionId)
                ? matched.adoptionId
                : null;
            if (resolvedAdoptionId) {
              navigate(`${ROUTES.manage}?adoptionId=${resolvedAdoptionId}&dogId=${abandonedDogId}`);
              return;
            }
          }

          // 매칭 실패 시에도 manage로는 이동
          navigate(ROUTES.manage);
          return;
        } catch {
          navigate(ROUTES.manage);
          return;
        }
      }

      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        openAlert({ title: "로그인 필요", message: "입양을 진행하려면 로그인이 필요합니다." });
        navigate(ROUTES.login, { state: { from: location.pathname } });
        return;
      }

      const message = err instanceof Error ? err.message : "입양 절차를 시작하지 못했습니다.";
      setSubmitError(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  아래 카드에서 강아지를 <span className="text-gray-900">드래그</span>하거나{" "}
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
                    {dog.centerName ? <div className="mt-2 text-xs text-gray-400">{dog.centerName}</div> : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button
            variant="mypage"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="rounded-md"
          >
            {isSubmitting ? "처리 중..." : "입양하기"}
          </Button>
        </div>
      </div>

      <AlertModal {...alertProps} />
    </div>
  );
}
