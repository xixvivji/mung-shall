import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

/**
 * TODO: 나중에 API 연동 시 이 타입 그대로 사용
 */
type DogItem = {
  id: string;
  name: string;
  imageUrl: string;
  status: "보호중" | "입양대기";
  desertionNo: string;
};

const MOCK_DOGS: DogItem[] = [
  {
    id: "1",
    name: "믹스견",
    imageUrl: "/assets/images/dog1.png",
    status: "보호중",
    desertionNo: "430366202500851",
  },
  {
    id: "2",
    name: "믹스견",
    imageUrl: "/assets/images/dog2.png",
    status: "보호중",
    desertionNo: "430366202500852",
  },
  {
    id: "3",
    name: "믹스견",
    imageUrl: "/assets/images/dog3.png",
    status: "보호중",
    desertionNo: "430366202500853",
  },
  {
    id: "4",
    name: "믹스견",
    imageUrl: "/assets/images/dog4.png",
    status: "보호중",
    desertionNo: "430366202500854",
  },
];

export function CenterDogsSection() {
  return (
    <Card className="rounded-3xl border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">
            보호 중
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            센터에서 현재 보호 중인 강아지 목록입니다.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {/* 카드 리스트 */}
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {MOCK_DOGS.map((dog) => (
            <div
              key={dog.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-md"
            >
              {/* 상태 배지 */}
              <Badge
                variant="secondary"
                className="absolute left-3 top-3 z-10"
              >
                {dog.status}
              </Badge>

              {/* 이미지 */}
              <div className="aspect-square overflow-hidden bg-slate-100">
                <img
                  src={dog.imageUrl}
                  alt={dog.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  draggable={false}
                />
              </div>

              {/* 정보 */}
              <div className="p-3">
                <div className="text-sm font-medium text-slate-900">
                  {dog.name}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  desertionNo | {dog.desertionNo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
