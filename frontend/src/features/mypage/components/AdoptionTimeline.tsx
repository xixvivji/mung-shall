import { CheckCircle2, Circle } from 'lucide-react';

const stages = [
  {
    id: 'A',
    title: '입양 전',
    status: 'completed',
    substeps: [
      { title: '회원가입 및 설문조사', status: 'completed' },
      { title: '유기견 선택', status: 'completed' },
      { title: '입양 신청서 제출', status: 'completed' },
    ]
  },
  {
    id: 'B',
    title: '입양 중',
    status: 'current',
    substeps: [
      { title: '서류 검토', status: 'completed' },
      { title: '전화 인터뷰', status: 'current' },
      { title: '가정 방문 평가', status: 'pending' },
      { title: '최종 승인', status: 'pending' },
    ]
  },
  {
    id: 'C',
    title: '입양 후',
    status: 'pending',
    substeps: [
      { title: '입양 계약서 작성', status: 'pending' },
      { title: '반려견 인수', status: 'pending' },
      { title: '사후 관리', status: 'pending' },
    ]
  }
];

export function AdoptionTimeline() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl text-gray-400 mb-8">입양 진행 타임라인</h2>
      
      {/* Main Timeline */}
      <div className="relative mb-12">
        <div className="flex items-center justify-between mb-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                  stage.status === 'completed' 
                    ? 'bg-blue-400 text-white' 
                    : stage.status === 'current'
                    ? 'bg-blue-100 border-4 border-blue-400 text-blue-400'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <span className="text-2xl font-semibold">{stage.id}</span>
                  )}
                </div>
                <span className={`text-lg font-medium ${
                  stage.status === 'current' ? 'text-blue-400' : stage.status === 'completed' ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {stage.title}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div className={`h-1 flex-1 -mt-12 ${
                  stage.status === 'completed' ? 'bg-blue-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Substeps */}
      <div className="grid grid-cols-3 gap-8">
        {stages.map((stage) => (
          <div key={stage.id}>
            <h3 className="font-medium text-gray-900 mb-4">{stage.title} 단계</h3>
            <div className="space-y-3">
              {stage.substeps.map((substep, index) => (
                <div key={index} className="flex items-center gap-3">
                  {substep.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  ) : substep.status === 'current' ? (
                    <Circle className="w-5 h-5 text-blue-400 fill-blue-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    substep.status === 'completed' || substep.status === 'current' 
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                  }`}>
                    {substep.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
