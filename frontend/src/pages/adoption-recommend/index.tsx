import { RecommendSection, useRecommendList } from "@/features/recommend";

export default function AdoptionRecommendPage() {
  const { items, loading } = useRecommendList();

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <h1 className="text-2xl font-semibold">추천 입양 목록</h1>
      <div className="mt-8">
        {loading ? <div className="text-sm text-[#777]">불러오는 중...</div> : <RecommendSection items={items} />}
      </div>
    </section>
  );
}
