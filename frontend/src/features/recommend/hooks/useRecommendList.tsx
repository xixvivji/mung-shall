import { useEffect, useState } from "react";
import type { RecommendDog } from "../types";
import { fetchRecommendList } from "../api/recommendApi";

export default function useRecommendList() {
  const [items, setItems] = useState<RecommendDog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchRecommendList().then((data) => {
      if (mounted) {
        setItems(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { items, loading };
}
