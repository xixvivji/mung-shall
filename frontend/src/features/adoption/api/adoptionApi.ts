import type { AdoptionDog } from "../types";

export async function fetchAdoptionList(): Promise<AdoptionDog[]> {
  return [
    { id: "demo-1", name: "Coco", breed: "Mixed", age: "2 years" },
    { id: "demo-2", name: "Bori", breed: "Jindo", age: "1 year" },
    { id: "demo-3", name: "Mong", breed: "Poodle", age: "3 years" },
  ];
}
