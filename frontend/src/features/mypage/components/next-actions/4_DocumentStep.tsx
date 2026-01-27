import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";

type Props = {
  isEditable: boolean;
};

export function DocumentStep({ isEditable }: Props) {
  const [files, setFiles] = useState<File[]>([]);

  const meta = useMemo(
    () =>
      files.map((f) => ({
        name: f.name,
        sizeKB: Math.round(f.size / 1024),
        type: f.type || "unknown",
      })),
    [files]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-900">입양 문서 제출</p>
        <p className="mt-1 text-sm text-gray-500">
          요구 문서를 업로드하세요. (현재는 UI만 구현)
        </p>

        <div className="mt-5">
          <input
            type="file"
            multiple
            disabled={!isEditable}
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[#eef2ff] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#5f7cf7] hover:file:bg-[#e0e7ff] disabled:opacity-60"
          />
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
          {meta.length === 0 ? (
            <p className="text-gray-500">업로드할 파일을 선택하세요.</p>
          ) : (
            <ul className="space-y-2">
              {meta.map((m, i) => (
                <li key={`${m.name}-${i}`} className="flex items-center justify-between gap-3">
                  <span className="font-medium text-gray-900 truncate">{m.name}</span>
                  <span className="text-gray-500 shrink-0">
                    {m.sizeKB} KB · {m.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isEditable && (
          <div className="mt-5 flex gap-3">
            <Button className="rounded-lg" disabled={files.length === 0}>
              문서 제출
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
              disabled={files.length === 0}
              onClick={() => setFiles([])}
            >
              선택 취소
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
