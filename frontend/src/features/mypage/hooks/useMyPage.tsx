import { useEffect, useState } from "react";
import type { MyDog, MyPageSummary } from "../types";
import { fetchMyDogs, fetchMyPageSummary } from "../api/mypageApi";

export default function useMyPage() {
  const [summary, setSummary] = useState<MyPageSummary | null>(null);
  const [dogs, setDogs] = useState<MyDog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchMyPageSummary(), fetchMyDogs()]).then(([summaryData, dogsData]) => {
      if (mounted) {
        setSummary(summaryData);
        setDogs(dogsData);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { summary, dogs, loading };
}
