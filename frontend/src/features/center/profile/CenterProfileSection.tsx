export function CenterProfileSection() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">센터 프로필</h1>
          <p className="mt-1 text-sm text-slate-600">
            센터 정보(이름/주소/연락처/소개)를 확인하고 수정합니다.
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          수정
        </button>
      </div>

      {/* TODO: 프로필 폼/표시 영역 */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4 text-sm">센터명</div>
        <div className="rounded-2xl border border-slate-200 p-4 text-sm">연락처</div>
        <div className="rounded-2xl border border-slate-200 p-4 text-sm sm:col-span-2">주소</div>
      </div>
    </div>
  );
}
