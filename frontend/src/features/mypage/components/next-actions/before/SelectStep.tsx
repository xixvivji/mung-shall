import { Button } from "@/shared/ui/button";

type Props = {
  /** 제출 완료 시 다음 단계로 이동 */
  onSubmitSuccess: () => void;
};

export function SelectStep({ onSubmitSuccess }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            사전 설문
          </h3>
          <p className="text-sm text-gray-500">
            입양 전 간단한 설문 단계입니다. (현재는 UI 테스트용)
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          설문 내용은 생략되었습니다.  
          제출 버튼을 누르면 다음 단계로 이동합니다.
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            className="rounded-xl bg-[#5f7cf7] px-6 py-2 text-white"
            onClick={onSubmitSuccess}
          >
            제출하기
          </Button>
        </div>
      </div>
    </div>
  );
}
