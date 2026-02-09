import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useAuth from "@/features/auth/hooks/useAuth";
import { startAdoptionProcess } from "@/features/adoption/api/adoptionApi";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/constants/routes";
import { ApiError } from "@/shared/api/client";

// NOTE: 아래 데이터와 API 함수는 예시입니다.
// 실제 프로젝트 구조에 맞게 Dog 상세 정보를 가져오는 API를 연동해야 합니다.
type DogDetails = {
  id: number;
  name: string;
  breed: string;
  age: number;
  imageUrl: string;
  description: string;
};

async function fetchDogDetails(id: number): Promise<DogDetails> {
  // TODO: 실제 API 호출로 대체하세요.
  // 예) const response = await client.get(`/api/v1/dogs/${id}`); return response.data;
  console.log(`Fetching details for dog ${id}...`);

  return {
    id,
    name: "방구",
    breed: "진돗개",
    age: 2,
    imageUrl: `https://placedog.net/500/300?id=${id}`,
    description: "사람을 아주 좋아하고 애교가 많은 방구입니다. 좋은 가족을 기다리고 있어요.",
  };
}

/**
 * 유기견 상세 페이지 및 입양 신청 시작
 *
 * 라우트 설정 참고:
 * 이 컴포넌트는 '/adoption/:dogId' 같은 경로로 렌더링되어야 합니다.
 * React Router를 사용한다면:
 * <Route path="/adoption/:dogId" element={<DogDetailPage />} />
 */
export default function DogDetailPage() {
  const { dogId } = useParams<{ dogId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [dog, setDog] = useState<DogDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const numericDogId = Number(dogId);

    if (!dogId || Number.isNaN(numericDogId)) {
      setError("유효하지 않은 ID입니다.");
      setIsLoading(false);
      return;
    }

    fetchDogDetails(numericDogId)
      .then(setDog)
      .catch(() => setError("상세 정보를 불러오는 데 실패했습니다."))
      .finally(() => setIsLoading(false));
  }, [dogId]);

  const handleApply = async () => {
    if (!dogId) return;

    if (!user) {
      // 로그인 페이지로 보내고, 로그인 성공 후 현재 페이지로 돌아오도록 state에 from을 전달
      alert("로그인이 필요합니다.");
      navigate(ROUTES.login, { state: { from: location.pathname } });
      return;
    }

    setIsApplying(true);

    try {
      const { adoptionId } = await startAdoptionProcess({
        userId: user.userId,
        abandonedDogId: Number(dogId),
      });

      // 성공 시 manage 페이지로 이동
      alert("입양 신청이 시작되었습니다. 입양 관리 페이지로 이동합니다.");
      navigate(`/manage/${adoptionId}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // 409 Conflict: 이미 진행 중인 입양 프로세스가 있는 경우
        // API 응답에 기존 adoptionId가 포함되어 있다고 가정
        const existingAdoptionId = (err as unknown as { data?: { adoptionId?: number | string } }).data?.adoptionId;

        const proceed = window.confirm(
          "이미 진행 중인 입양 절차가 있습니다. 입양 관리 페이지로 이동하시겠습니까?"
        );

        if (proceed) {
          if (existingAdoptionId) {
            navigate(`/manage/${existingAdoptionId}`);
          } else {
            alert("진행 중인 입양 절차 정보를 가져오지 못했습니다. 마이페이지로 이동합니다.");
            navigate(ROUTES.mypage);
          }
        }
      } else {
        // 기타 에러
        alert("입양 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        console.error(err);
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">상세 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!dog) {
    return <div className="p-8 text-center">해당 유기견 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <img src={dog.imageUrl} alt={dog.name} className="h-auto w-full rounded-lg shadow-lg" />
        </div>

        <div className="flex flex-col">
          <h1 className="text-4xl font-bold">{dog.name}</h1>
          <p className="mt-2 text-lg text-gray-600">
            {dog.breed}, {dog.age}살
          </p>
          <p className="mt-4 flex-grow text-gray-800">{dog.description}</p>

          <Button size="lg" className="mt-6 w-full rounded-lg" onClick={handleApply} disabled={isApplying}>
            {isApplying ? "신청 처리 중..." : "입양 신청하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
