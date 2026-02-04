import { useEffect, useState } from "react";
import { fetchFaqs } from "../api/faqApi";
import type { Faq } from "../types";
import { FaqItem } from "./FaqItem";

// ✅ 이미지 import (alias 사용 시)
import guideImage from "@/assets/images/길잡이.png";
// ❗ alias(@/) 없으면 아래처럼 바꿔서 쓰세요
// import guideImage from "../assets/images/길잡이.png";

export function FaqList() {
  const [items, setItems] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchFaqs({ page: 0, size: 50 });

        if (!mounted) return;
        setItems(res.items);
        setOpenId(res.items[0]?.id ?? null);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "FAQ 로딩 실패");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="grid grid-cols-[240px_1fr] gap-20">
        {/* ✅ 왼쪽: FAQ 제목 + 이미지 */}
        <div className="flex flex-col gap-8">
          <h1 className="text-[48px] font-bold tracking-tight text-[#333]">
            FAQ
          </h1>

          <img
            src={guideImage}
            alt="FAQ 길잡이"
            className="w-full mt-30 max-w-[220px] select-none"
            draggable={false}
          />
        </div>

        {/* ✅ 오른쪽: FAQ 리스트 */}
        <div className="flex flex-col gap-6">
          {loading && <div className="text-sm text-gray-500">불러오는 중...</div>}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-sm text-gray-500">등록된 FAQ가 없습니다.</div>
          )}

          {!loading &&
            !error &&
            items.map((item) => (
              <FaqItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                open={openId === item.id}
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
