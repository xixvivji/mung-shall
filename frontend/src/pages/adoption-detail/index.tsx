import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ActionButtons, DogGallery, useAdoptionDetail } from "@/features/adoptionDetail";

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#eee] py-3 text-sm">
      <span className="text-[#8a8a8a]">{label}</span>
      <span className="text-[#333]">{value && value.trim().length > 0 ? value : "정보 없음"}</span>
    </div>
  );
}

export default function AdoptionDetailPage() {
  const { id = "" } = useParams();
  const { detail, loading, error } = useAdoptionDetail(id);

  const descriptionItems = useMemo(() => {
    const raw = detail?.description ?? "";
    const items = raw
      .split(/[\n/.;]/g)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return items.length > 0 ? items : ["특이사항 정보가 없습니다."];
  }, [detail?.description]);


  if (loading) {
    return <div className="px-6 py-16 text-sm text-[#777]">Loading detail...</div>;
  }

  if (error) {
    return <div className="px-6 py-16 text-sm text-[#d14343]">{error}</div>;
  }

  if (!detail) {
    return <div className="px-6 py-16 text-sm text-[#777]">No detail found.</div>;
  }

  const title = detail.careNm ? `${detail.careNm} 강아지 입양 상세 정보` : "강아지 입양 상세 정보";
  const idLabel = detail.noticeNo ?? detail.desertionNo ?? detail.id;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-[#333] md:text-3xl">{title}</h1>
        <p className="text-sm font-medium text-[#777]">ID {idLabel}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <DogGallery images={detail.images} />

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#eee] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="text-lg font-semibold text-[#333]">{detail.noticeNo ?? detail.desertionNo ?? detail.name}</div>
            <div className="mt-3">
              <InfoRow label="품종" value={detail.breed} />
              <InfoRow label="성별" value={detail.sexCd} />
              <InfoRow label="색상" value={detail.colorCd} />
              <InfoRow label="나이" value={detail.age} />
              <InfoRow label="체중" value={detail.weight} />
              <InfoRow label="발견 장소" value={detail.happenPlace} />
              <InfoRow
                label="공고 기간"
                value={
                  detail.noticeSdt || detail.noticeEdt
                    ? `${detail.noticeSdt ?? "-"} ~ ${detail.noticeEdt ?? "-"}`
                    : undefined
                }
              />
              <InfoRow label="상태" value={detail.processState} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#eee] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="text-base font-semibold text-[#333]">보호소 정보</div>
            <div className="mt-3 space-y-2 text-sm text-[#555]">
              <p className="font-medium text-[#333]">{detail.careNm ?? "보호소 정보 없음"}</p>
              <p>{detail.careAddr ?? "주소 정보 없음"}</p>
              <p>{detail.careTel ?? "연락처 정보 없음"}</p>
              <p>{detail.careOwnerNm ?? "담당자 정보 없음"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#eee] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="text-base font-semibold text-[#333]">특이사항</div>
            <ul className="mt-3 space-y-2 text-sm text-[#555]">
              {descriptionItems.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-start gap-2">
                  <span className="mt-1 size-2 rounded-full bg-[#cfcfcf]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <ActionButtons dogId={detail.id} />
            <div className="flex items-center gap-2 rounded-full border border-[#f3e1cc] bg-[#fff7eb] px-4 py-2 text-xs text-[#9b6a2f]">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#f6d8b0] text-[10px] font-bold">!</span>
              안락사 대상이 될 수 있어요.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
