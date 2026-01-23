import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { FileText, Phone, Home, CheckSquare, Calendar, ClipboardList } from 'lucide-react';

const actions = [
  {
    icon: Phone,
    title: '전화 인터뷰 일정 잡기',
    description: '입양 담당자와 전화 인터뷰를 진행해주세요',
    status: '진행중',
    statusColor: 'bg-blue-100 text-blue-700 border-blue-200',
    buttonText: '일정 확인하기'
  },
  {
    icon: FileText,
    title: '추가 서류 제출',
    description: '신분증 사본과 거주지 증빙 서류를 제출해주세요',
    status: '미완료',
    statusColor: 'bg-orange-100 text-orange-700 border-orange-200',
    buttonText: '서류 업로드'
  },
  {
    icon: ClipboardList,
    title: '입양 전 교육 이수',
    description: '반려견 양육에 필요한 기본 교육을 이수해주세요',
    status: '미완료',
    statusColor: 'bg-orange-100 text-orange-700 border-orange-200',
    buttonText: '교육 시작하기'
  },
  {
    icon: Home,
    title: '가정 방문 평가 준비',
    description: '방문 평가를 위한 체크리스트를 확인해주세요',
    status: '대기중',
    statusColor: 'bg-gray-100 text-gray-600 border-gray-200',
    buttonText: '체크리스트 보기'
  },
  {
    icon: Calendar,
    title: '건강검진 예약',
    description: '입양 전 반려견 건강검진 일정을 확인하세요',
    status: '완료',
    statusColor: 'bg-green-100 text-green-700 border-green-200',
    buttonText: '결과 확인'
  },
  {
    icon: CheckSquare,
    title: '입양 전 준비물 구매',
    description: '반려견 용품 쇼핑 리스트를 확인하세요',
    status: '진행중',
    statusColor: 'bg-blue-100 text-blue-700 border-blue-200',
    buttonText: '리스트 보기'
  },
];

export function NextActions() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl text-gray-400 mb-8">해야 할 일</h2>
      
      <div className="grid grid-cols-2 gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <Badge variant="outline" className={action.statusColor}>
                  {action.status}
                </Badge>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{action.description}</p>
              <Button 
                variant="outline" 
                className="w-full rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
              >
                {action.buttonText}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
