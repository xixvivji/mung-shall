import { Button } from '@/shared/ui/button';
import { CheckCircle2, Circle, Video, Calendar } from 'lucide-react';

const roadmapItems = [
  { title: '입양 계약서 작성 및 서명', completed: true },
  { title: '반려견 건강검진 완료', completed: true },
  { title: '반려동물 등록증 발급', completed: true },
  { title: '첫 주 적응기 체크리스트', completed: false },
  { title: '1개월 후 사후 관리 전화', completed: false },
  { title: '3개월 후 방문 체크', completed: false },
];

export function PostAdoptionTools() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Roadmap Checklist */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl text-gray-400 mb-8">입양 후 로드맵</h2>
        
        <div className="space-y-4">
          {roadmapItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              {item.completed ? (
                <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <span className={`${
                item.completed ? 'text-gray-900 line-through' : 'text-gray-900'
              }`}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-6 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
        >
          전체 로드맵 보기
        </Button>
      </div>
      
      {/* Video Call Appointment */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-sm border border-blue-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-blue-400 flex items-center justify-center">
            <Video className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-gray-900 mb-1">화상 상담 예약</h2>
            <p className="text-sm text-gray-600">전문가와 1:1 상담을 진행하세요</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">예약된 일정</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-semibold text-gray-900">1월 28일</span>
            <span className="text-gray-500">화요일</span>
          </div>
          <p className="text-lg text-blue-600">오후 2:00 - 2:30</p>
        </div>
        
        <Button 
          className="w-full bg-blue-400 hover:bg-blue-500 text-white rounded-lg h-12"
        >
          통화 입장하기
        </Button>
        
        <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700">
          예약 변경하기
        </button>
      </div>
    </div>
  );
}
