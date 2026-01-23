import { useParams } from "react-router-dom";
import { ActionButtons, DogGallery, DogProfile, InfoTable, useAdoptionDetail } from "@/features/adoptionDetail";

export default function AdoptionDetailPage() {
  const { id = "" } = useParams();
  const { detail, loading } = useAdoptionDetail(id);

  if (loading || !detail) {
    return <div className="px-6 py-16 text-sm text-[#777]">상세 정보를 불러오는 중...</div>;
  }

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <DogGallery images={detail.images} />
        <div className="space-y-6">
          <DogProfile detail={detail} />
          <InfoTable
            rows={[
              { label: "품종", value: detail.breed },
              { label: "ID", value: detail.id },
            ]}
          />
          <ActionButtons />
        </div>
      </div>
    </section>
  );
}
