import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "@/shared/constants/routes";
import { getRandomDogImages } from "@/features/home/api/dogImageApi";

type CardItem = {
  id: number;
  imageUrl: string;
};

export default function IntroSection4() {
  const [cards, setCards] = useState<CardItem[]>([]);

  useEffect(() => {
    getRandomDogImages(15)
      .then((res) => {
        console.log("🔍 randomDogImages sample", res?.[0]);
        
        const mapped: CardItem[] = res
          .map((item) => ({
            id: item.id, // 🔹 /adoption/:id 로 라우트
            imageUrl: item.imageUrls?.[0],
          }))
          .filter((v): v is CardItem => Boolean(v.imageUrl));

        // 무한 슬라이드용으로 두 번 이어붙임
        setCards([...mapped, ...mapped]);
      })
      .catch((err) => {
        console.error("랜덤 강아지 이미지 로딩 실패", err);
      });
  }, []);

  return (
    <section className="w-full bg-white py-28">
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <h2 className="text-4xl font-semibold text-[#111]">
          새로운 가족을 만나러 가볼까요?
        </h2>

        <div className="mt-20 mb-40">
          <Link
            to={ROUTES.adoption}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            입양하러 가기
          </Link>
        </div>

        <div className="relative mt-16 overflow-hidden py-8">
          {/* 좌측 페이드 */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-28 bg-gradient-to-r from-white to-transparent" />
          {/* 우측 페이드 */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-28 bg-gradient-to-l from-white to-transparent" />

          <div className="flex w-max items-center animate-slide-left gap-8">
            {cards.map((card, idx) => (
              <Link
                key={`${card.id}-${idx}`}
                to={ROUTES.adoptionDetail(card.id)}
                className="relative h-[260px] w-[180px] flex-shrink-0 overflow-hidden
                           rounded-3xl transition-transform duration-300 ease-out
                           hover:z-10 hover:scale-105"
              >
                <img
                  src={card.imageUrl}
                  alt="강아지 이미지"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
