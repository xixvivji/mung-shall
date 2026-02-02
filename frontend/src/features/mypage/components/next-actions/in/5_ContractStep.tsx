import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Document, Page, pdfjs } from "react-pdf";
import { ApiError } from "@/shared/api/client";
import {
  deleteAdoptionContract,
  getAdoptionContract,
  uploadAdoptionContract,
} from "@/features/postAdoption/api/postAdoptionApi";
import type { AdoptionContractResponse } from "@/features/mypage/types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/* ================== TYPES ================== */
type Props = {
  isEditable: boolean;
  onSubmitSuccess: () => void;
  adoptionId: number;
};

type FieldKey =
  | "name"
  | "birthY"
  | "birthM"
  | "birthD"
  | "address"
  | "phone1"
  | "phone2"
  | "phone3"
  | "breedingPlace"
  | "job"
  | "animalType"
  | "breed"
  | "age"
  | "color"
  | "manageNo"
  | "agreeYes"
  | "agreeNo"
  | "dateY"
  | "dateM"
  | "dateD"
  | "applicantName"
  | "signature";

type OverlayValues = Record<FieldKey, string>;

type FieldDef = {
  key: FieldKey;
  x: number;
  y: number;
  w: number;
  h: number;
  type?: "text" | "checkbox" | "signature";
};

/* ================== CONST ================== */
const DEFAULT_VALUES: OverlayValues = {
  name: "",
  birthY: "",
  birthM: "",
  birthD: "",
  address: "",
  phone1: "",
  phone2: "",
  phone3: "",
  breedingPlace: "",
  job: "",
  animalType: "",
  breed: "",
  age: "",
  color: "",
  manageNo: "",
  agreeYes: "0",
  agreeNo: "0",
  dateY: "",
  dateM: "",
  dateD: "",
  applicantName: "",
  signature: "", // dataURL
};

const BASE_WIDTH = 595;
const BASE_HEIGHT = 842;

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 400) return "Invalid request. Please check the file.";
    if (error.status === 401) return "Login required.";
    if (error.status === 403) return "You do not have permission.";
    if (error.status === 404) return "Contract not found.";
    if (error.status === 409) return "The contract status has changed. Please refresh.";
    if (error.status === 413) return "File is too large.";
    if (error.status === 415) return "Unsupported file type.";
    if (error.status >= 500) return "Server error. Please try again.";
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

/* ================== SIGNATURE PAD ================== */
function SignaturePad({
  width,
  height,
  onEnd,
  onClear,
}: {
  width: number;
  height: number;
  onEnd: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useLayoutEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
  }, []);

  const getPos = (e: MouseEvent | TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX =
      "touches" in e ? (e.touches[0]?.clientX ?? 0) : (e as MouseEvent).clientX;
    const clientY =
      "touches" in e ? (e.touches[0]?.clientY ?? 0) : (e as MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (ev: any) => {
    ev.preventDefault?.();
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(ev.nativeEvent ?? ev);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (ev: any) => {
    if (!drawing.current) return;
    ev.preventDefault?.();
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(ev.nativeEvent ?? ev);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onEnd(canvasRef.current!.toDataURL("image/png"));
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    onClear();
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={Math.max(1, Math.floor(width))}
        height={Math.max(1, Math.floor(height))}
        className="border border-gray-400 bg-white rounded-sm"
        style={{ touchAction: "none" }}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs text-gray-600 underline"
          onClick={clear}
        >
          서명 지우기
        </button>
      </div>
    </div>
  );
}

/* ================== OVERLAY ================== */
function AdoptionPdfOverlay({
  fileUrl,
  values,
  onChange,
}: {
  fileUrl: string;
  values: OverlayValues;
  onChange: (next: OverlayValues) => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [wrapW, setWrapW] = useState(720);
  const [loaded, setLoaded] = useState(false);
  const [pageH, setPageH] = useState(BASE_HEIGHT);
  const [signOpen, setSignOpen] = useState(false);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => setWrapW(wrapRef.current!.clientWidth));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const scale = useMemo(() => wrapW / BASE_WIDTH, [wrapW]);

  const fields: FieldDef[] = useMemo(
    () => [
      { key: "name", x: 200, y: 137, w: 100, h: 15 },
      { key: "birthY", x: 370, y: 137, w: 40, h: 15 },
      { key: "birthM", x: 420, y: 137, w: 30, h: 15 },
      { key: "birthD", x: 460, y: 137, w: 30, h: 15 },
      { key: "address", x: 200, y: 156, w: 300, h: 15 },
      { key: "phone1", x: 195, y: 175, w: 33, h: 15 },
      { key: "phone2", x: 230, y: 175, w: 45, h: 15 },
      { key: "phone3", x: 280, y: 175, w: 45, h: 15 },
      { key: "breedingPlace", x: 200, y: 193, w: 105, h: 15 },
      { key: "job", x: 425, y: 193, w: 105, h: 15 },
      { key: "animalType", x: 160, y: 220, w: 65, h: 30 },
      { key: "breed", x: 265, y: 220, w: 65, h: 30 },
      { key: "age", x: 370, y: 220, w: 65, h: 30 },
      { key: "color", x: 485, y: 220, w: 65, h: 30 },
      { key: "manageNo", x: 200, y: 263, w: 200, h: 30 },

      { key: "agreeYes", type: "checkbox", x: 438, y: 480, w: 14, h: 14 },
      { key: "agreeNo", type: "checkbox", x: 494, y: 480, w: 14, h: 14 },

      { key: "dateY", x: 430, y: 551, w: 20, h: 15 },
      { key: "dateM", x: 460, y: 551, w: 20, h: 15 },
      { key: "dateD", x: 500, y: 551, w: 20, h: 15 },

      { key: "applicantName", x: 410, y: 593, w: 90, h: 15 },
      { key: "signature", type: "signature", x: 505, y: 593, w: 60, h: 20 },
    ],
    []
  );

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="[&_canvas]:pointer-events-none">
        <Document
          file={fileUrl}
          loading={<div className="text-sm text-gray-500">PDF 불러오는 중...</div>}
          onLoadSuccess={() => setLoaded(true)}
          onLoadError={() => setLoaded(false)}
        >
          <Page
            pageNumber={1}
            width={wrapW}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={() => {
              const c = wrapRef.current?.querySelector("canvas");
              if (c) setPageH(c.height);
            }}
          />
        </Document>
      </div>

      {loaded && (
        <div className="absolute inset-0" style={{ width: wrapW, height: pageH }}>
          {fields.map((f) => {
            const style: React.CSSProperties = {
              position: "absolute",
              left: f.x * scale,
              top: f.y * scale,
              width: f.w * scale,
              height: f.h * scale,
            };

            if (f.type === "checkbox") {
              const checked = values[f.key] === "1";
              return (
                <input
                  key={f.key}
                  type="checkbox"
                  className="absolute accent-black"
                  style={style}
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked;
                    if (f.key === "agreeYes") {
                      onChange({ ...values, agreeYes: next ? "1" : "0", agreeNo: "0" });
                    } else {
                      onChange({ ...values, agreeNo: next ? "1" : "0", agreeYes: "0" });
                    }
                  }}
                />
              );
            }

            if (f.type === "signature") {
              return (
                <div key={f.key} style={style}>
                  {values.signature ? (
                    <button
                      type="button"
                      className="w-full h-full border border-gray-300 bg-white/70"
                      onClick={() => setSignOpen(true)}
                      title="클릭해서 서명 수정"
                    >
                      <img
                        src={values.signature}
                        alt="signature"
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full h-full border border-gray-300 bg-white/70 text-[10px] text-gray-600"
                      onClick={() => setSignOpen(true)}
                    >
                      서명
                    </button>
                  )}

                  {signOpen && (
                    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
                      <div className="w-[520px] max-w-[calc(100vw-32px)] rounded-xl bg-white p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold">서명 입력</p>
                          <button
                            type="button"
                            className="text-sm text-gray-600"
                            onClick={() => setSignOpen(false)}
                          >
                            닫기
                          </button>
                        </div>

                        <SignaturePad
                          width={480}
                          height={200}
                          onEnd={(img) => onChange({ ...values, signature: img })}
                          onClear={() => onChange({ ...values, signature: "" })}
                        />

                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => onChange({ ...values, signature: "" })}
                          >
                            비우기
                          </Button>
                          <Button onClick={() => setSignOpen(false)}>완료</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <input
                key={f.key}
                type="text"
                className="absolute border border-gray-300 bg-white/70 px-1 text-[11px]"
                style={style}
                value={values[f.key]}
                onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================== STEP ================== */
export function ContractStep({ isEditable, onSubmitSuccess, adoptionId }: Props) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<OverlayValues>(DEFAULT_VALUES);
  const pdfUrl = "/docs/adoption-application.pdf";
  const [contract, setContract] = useState<AdoptionContractResponse | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canUpload = isEditable && !!adoptionId && !uploading && !deleting;
  const selectedMeta = useMemo(() => {
    if (!selectedFile) return null;
    return {
      name: selectedFile.name,
      size: formatFileSize(selectedFile.size),
      type: selectedFile.type || "unknown",
    };
  }, [selectedFile]);

  const loadContract = useCallback(
    async (targetId: number, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setContractLoading(true);
      }
      setContractError(null);

      try {
        const data = await getAdoptionContract(targetId);
        setContract(data);
        if (import.meta.env.DEV) {
          console.debug("[contract] fetched", data);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setContract(null);
          setContractError(null);
        } else {
          setContract(null);
          setContractError(resolveApiErrorMessage(err, "Failed to load contract."));
        }
      } finally {
        if (!silent) {
          setContractLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!adoptionId) {
      setContract(null);
      setContractError("Missing adoptionId.");
      return;
    }

    loadContract(adoptionId!).catch(() => {
      // loadContract handles its own errors
    });
  }, [adoptionId, loadContract]);

  const handleUpload = async () => {
    if (!canUpload) return;
    if (!selectedFile) {
      setContractError("Please select a contract file.");
      return;
    }

    setUploading(true);
    setContractError(null);

    try {
      const data = await uploadAdoptionContract(adoptionId, selectedFile);
      setContract(data);
      setSelectedFile(null);
      onSubmitSuccess();
      await loadContract(adoptionId, { silent: true });
    } catch (err) {
      setContractError(resolveApiErrorMessage(err, "Failed to upload contract."));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!adoptionId || !contract || deleting) return;
    const confirmed = window.confirm("Delete the contract file?");
    if (!confirmed) return;

    setDeleting(true);
    setContractError(null);

    try {
      await deleteAdoptionContract(adoptionId);
      setContract(null);
      setSelectedFile(null);
      await loadContract(adoptionId!, { silent: true });
    } catch (err) {
      setContractError(resolveApiErrorMessage(err, "Failed to delete contract."));
      if (err instanceof ApiError && (err.status === 404 || err.status === 409)) {
        await loadContract(adoptionId!, { silent: true });
      }
    } finally {
      setDeleting(false);
    }
  };

  // ✅ 뒤 배경 스크롤 막기
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Contract status</p>
            <p className="mt-1 text-sm text-gray-500">
              Check the uploaded contract or delete it before re-uploading.
            </p>
          </div>
          {contractLoading ? <span className="text-xs text-gray-500">Loading...</span> : null}
        </div>

        {contractError ? <p className="mt-2 text-xs text-red-600">{contractError}</p> : null}

        {!adoptionId ? (
          <p className="mt-4 text-xs text-gray-500">
            Adoption ID is missing. Please reopen this step from the adoption flow.
          </p>
        ) : contract ? (
          <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            <p className="text-sm font-semibold text-gray-900">
              {contract.originalFileName || "Contract file"}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(contract.fileSize)} - {formatDateTime(contract.uploadedAt)}
            </p>
            {contract.contractFileUrl ? (
              <a
                className="inline-flex text-xs font-semibold text-blue-600 hover:underline"
                href={contract.contractFileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open contract file
              </a>
            ) : null}

            <div className="pt-2">
              <Button
                variant="outline"
                className="rounded-lg"
                disabled={!isEditable || deleting}
                onClick={handleDelete}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            No contract uploaded yet.
          </div>
        )}

        {contractError && adoptionId ? (
          <div className="mt-4">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => loadContract(adoptionId)}
              disabled={contractLoading}
            >
              Retry
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Upload contract</p>
            <p className="mt-1 text-sm text-gray-500">
              Upload a signed contract file (PDF recommended).
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            className="rounded-lg"
            disabled={!canUpload}
            onClick={() => fileInputRef.current?.click()}
          >
            Select file
          </Button>

          {selectedFile && (
            <Button
              variant="outline"
              className="rounded-lg"
              disabled={!canUpload}
              onClick={() => setSelectedFile(null)}
            >
              Remove
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            disabled={!canUpload}
          />
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
          {!selectedMeta ? (
            <p className="text-gray-500">No file selected.</p>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{selectedMeta.name}</p>
              <p className="text-gray-500">
                {selectedMeta.size} - {selectedMeta.type}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            className="rounded-lg"
            disabled={!canUpload || !selectedFile}
            onClick={handleUpload}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          <Button variant="outline" className="rounded-lg" onClick={() => setOpen(true)}>
            View contract form
          </Button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40">
          {/* ??? ??? ??????????? */}
          <div className="h-full w-full overflow-y-auto py-8">
            <div className="mx-auto w-[860px] max-w-[calc(100vw-32px)]">
              {/* ??? ???: ??????????*/}
              <div className="bg-white rounded-xl shadow-xl max-h-[calc(100vh-4rem)] flex flex-col">
                {/* ??? */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">????????</p>
                      <p className="mt-1 text-sm text-gray-500">
                        PDF ??? ?????? ????????????????
                      </p>
                    </div>
                    <Button variant="outline" className="rounded-lg" onClick={() => setOpen(false)}>
                      ???
                    </Button>
                  </div>
                </div>

                {/* ??????????*/}
                <div className="p-6 overflow-y-auto">
                  <AdoptionPdfOverlay fileUrl={pdfUrl} values={values} onChange={setValues} />
                </div>

                {/* ??? ??? ??? */}
                <div className="border-t p-4 flex justify-end gap-2 bg-white sticky bottom-0">
                  <Button variant="outline" onClick={() => setValues(DEFAULT_VALUES)}>
                    ?????
                  </Button>
                  <Button onClick={() => setOpen(false)}>???</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
