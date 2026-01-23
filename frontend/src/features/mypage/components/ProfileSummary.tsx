import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { CheckCircle2, User } from 'lucide-react';

export function ProfileSummary() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <User className="w-10 h-10 text-blue-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-medium">김민지</h3>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              본인인증 완료
            </Badge>
          </div>
          <p className="text-gray-500 mb-6">minji.kim@email.com</p>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">설문조사 완료도</span>
              <span className="text-sm font-medium text-blue-500">75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-lg">
              내 정보 수정
            </Button>
            <Button className="bg-blue-400 hover:bg-blue-500 text-white rounded-lg">
              본인인증 하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
