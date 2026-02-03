import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/shared/ui/button";
import type { ContractOverlayFieldKey, ContractOverlayValues } from "./contractOverlayValues";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type FieldDef = {
  key: ContractOverlayFieldKey;
  x: number;
  y: number;
  w: number;
  h: number;
  type?: "text" | "checkbox" | "signature";
};

const BASE_WIDTH = 595;
const BASE_HEIGHT = 842;

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
        <button type="button" className="text-xs text-gray-600 underline" onClick={clear}>
          서명 지우기
        </button>
      </div>
    </div>
  );
}

/* ================== OVERLAY ================== */
export function AdoptionPdfOverlay({
  fileUrl,
  values,
  onChange,
}: {
  fileUrl: string;
  values: ContractOverlayValues;
  onChange: (next: ContractOverlayValues) => void;
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
              if (c) setPageH((c as HTMLCanvasElement).height);
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
