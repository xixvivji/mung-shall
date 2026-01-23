import { AdoptionTimeline, MyDogs, NextActions, PostAdoptionTools, ProfileSummary, useMyPage } from "@/features/mypage";

export default function MyPage() {
  const { summary, dogs, loading } = useMyPage();

  if (loading || !summary) {
    return <div className="px-6 py-16 text-sm text-[#777]">마이페이지를 불러오는 중...</div>;
  }

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">마이페이지</h1>
      <ProfileSummary summary={summary} />
      <AdoptionTimeline />
      <NextActions />
      <MyDogs dogs={dogs} />
      <PostAdoptionTools />
    </section>
  );
}
