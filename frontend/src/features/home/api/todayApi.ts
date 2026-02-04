import { api } from "@/shared/api/client";

export interface DogStatusCount {
  status: string;
  count: number;
}

export const getTodayStatusCounts = () => {
  return api<DogStatusCount[]>("/dogs/status-counts");
};
