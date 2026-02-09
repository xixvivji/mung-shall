import type { MyDog } from "@/features/mypage/types";
import useAuth from "@/features/auth/hooks/useAuth";
import useFavoriteDogs, {
  resolveFavoriteErrorMessage,
} from "@/features/adoption/hooks/useFavoriteDogs";
import AlertModal from "@/shared/components/AlertModal";
import FavoriteHeart from "@/shared/components/FavoriteHeart";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { MapPin } from "lucide-react";
import { ImageWithFallback } from "@/shared/ui/figma/ImageWithFallback";

type Props = {
  dogs: MyDog[];
};

type DogCard = {
  id: number | string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  location: string;
  image: string;
  status?: string;
};

const dummyDogs: { interest: DogCard[]; applied: DogCard[]; completed: DogCard[] } = {
  interest: [
    {
      id: 1,
      name: "뽀미",
      breed: "포메라니안",
      age: "2살",
      gender: "여아",
      location: "서울 강남구",
      image:
          "https://images.unsplash.com/photo-1626211596179-d1fe8beaf75c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: 2,
      name: "코코",
      breed: "코기",
      age: "3살",
      gender: "남아",
      location: "경기 성남시",
      image:
          "https://images.unsplash.com/photo-1713575029300-cdb14999ff65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: 3,
      name: "시바",
      breed: "시바견",
      age: "1살",
      gender: "여아",
      location: "서울 송파구",
      image:
          "https://images.unsplash.com/photo-1676551494386-50763077884c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
  ],
  applied: [
    {
      id: 4,
      name: "골디",
      breed: "골든 리트리버",
      age: "4살",
      gender: "남아",
      location: "인천 남동구",
      image:
          "https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      status: "서류 검토중",
    },
    {
      id: 5,
      name: "비글이",
      breed: "비글",
      age: "2살",
      gender: "여아",
      location: "서울 마포구",
      image:
          "https://images.unsplash.com/photo-1631048905843-88f82fba8fd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      status: "인터뷰 대기",
    },
  ],
  completed: [],
};

export function MyDogs({ dogs }: Props) {
  const { user } = useAuth();
  const { openAlert, alertProps } = useAlertModal();
  const { favoriteDogs, pendingIds, toggleFavorite, isFavorite, loading } =
      useFavoriteDogs();

  const interestDogs = user
      ? favoriteDogs.map((dog) => ({
        id: String(dog.dogId),
        name:
            dog.noticeNo ??
            dog.desertionNo ??
            dog.kindNm ??
            `Dog #${dog.dogId}`,
        breed: dog.kindNm ?? "알 수 없음",
        age: dog.age ?? "-",
        gender: "미상",
        location: dog.careNm ?? "-",
        image: dog.imageUrl ?? "",
      }))
      : dummyDogs.interest;

  const view = {
    ...dummyDogs,
    interest: interestDogs,
  };

  const handleToggleFavorite = async (dogId: string | number) => {
    const result = await toggleFavorite(dogId);
    if (result.status === "unauthenticated") {
      openAlert({ title: "로그인 필요", message: "로그인이 필요합니다." });
      return;
    }
    if (result.status === "error") {
      openAlert({
        title: "관심 등록 실패",
        message: resolveFavoriteErrorMessage(result.error),
      });
    }
  };

  const showInterestLoading = Boolean(user) && loading;
  const showInterestEmpty = Boolean(user) && !loading && view.interest.length === 0;

  void dogs;

  return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl text-gray-400 mb-8">내 강아지들</h2>

        <Tabs defaultValue="interest" className="w-full">
          <TabsList className="mb-8 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="interest" className="rounded-md px-8">
              관심 ({view.interest.length})
            </TabsTrigger>
            <TabsTrigger value="applied" className="rounded-md px-8">
              신청 ({view.applied.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-md px-8">
              완료 ({view.completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interest">
            {showInterestLoading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : showInterestEmpty ? (
                <div className="text-center py-12 text-gray-400">
                  관심 등록한 강아지가 없습니다.
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-6">
                  {view.interest.map((dog) => {
                    const id = String(dog.id);

                    return (
                        <div key={dog.id} className="group cursor-pointer">
                          <div className="relative mb-3 w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-50">
                            {dog.image ? (
                                <ImageWithFallback
                                    src={dog.image}
                                    alt={dog.name}
                                    className="h-full w-full object-contain object-center transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                  No image
                                </div>
                            )}

                            <FavoriteHeart
                                active={isFavorite(id)}
                                disabled={pendingIds.has(id)}
                                onToggle={() => handleToggleFavorite(id)}
                            />
                          </div>

                          <h3 className="font-medium text-gray-900 mb-1">{dog.name}</h3>
                          <p className="text-sm text-gray-500 mb-1">
                            {dog.breed} · {dog.age} · {dog.gender}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{dog.location}</span>
                          </div>
                        </div>
                    );
                  })}
                </div>
            )}
          </TabsContent>

          <TabsContent value="applied">
            <div className="grid grid-cols-3 gap-6">
              {view.applied.map((dog) => (
                  <div key={dog.id} className="group cursor-pointer">
                    <div className="relative mb-3 w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-50">
                      <ImageWithFallback
                          src={dog.image}
                          alt={dog.name}
                          className="h-full w-full object-contain object-center transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-400 text-white border-0">
                          {dog.status ?? "진행중"}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-1">{dog.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      {dog.breed} · {dog.age} · {dog.gender}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{dog.location}</span>
                    </div>
                  </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="text-center py-12 text-gray-400">
              아직 입양 완료된 강아지가 없습니다
            </div>
          </TabsContent>
        </Tabs>

        <AlertModal {...alertProps} />
      </div>
  );
}
