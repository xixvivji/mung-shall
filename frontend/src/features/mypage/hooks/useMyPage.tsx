import { useEffect, useState } from "react";
import type { MyDog } from "../types";
import { fetchMyDogs } from "../api/mypageApi";

export default function useMyPage() {
  const [dogs, setDogs] = useState<MyDog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchMyDogs().then((dogsData) => {
      if (mounted) {
        setDogs(dogsData);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { dogs, loading };
}
