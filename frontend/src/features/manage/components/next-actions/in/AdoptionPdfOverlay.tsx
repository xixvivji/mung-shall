// AdoptionPdfOverlay.tsx
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <canvas
        ref={canvasRef}
        width={Math.max(1, Math.floor(width))}
        height={Math.max(1, Math.floor(height))}
        style={{
          border: "1px solid #9ca3af",
          background: "#fff",
          borderRadius: 2,
          touchAction: "none",
        }}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="button" style={{ fontSize: 12, color: "#4b5563", textDecoration: "underline" }} onClick={clear}>
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
  mode = "edit",
}: {
  fileUrl: string;
  values: ContractOverlayValues;
  onChange: (next: ContractOverlayValues) => void;
  mode?: "edit" | "capture";
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

  const captureTextStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    fontSize: 11,
    lineHeight: "1.2",
    color: "#000",
    whiteSpace: "pre-wrap",
    padding: "0 2px",
  };

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      {/* 캡쳐/표시 공통: PDF 크기 고정 박스 */}
      <div
        style={{
          position: "relative", // ✅ inline
          width: wrapW,
          height: pageH,
          background: "#fff",
        }}
      >
        {/* react-pdf canvas */}
        <div>
          <Document
            file={fileUrl}
            loading={<div style={{ fontSize: 14, color: "#6b7280" }}>PDF 불러오는 중...</div>}
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

        {/* ✅ 오버레이 컨테이너: className="absolute inset-0" 쓰지 말고 inline */}
        {loaded && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: wrapW,
              height: pageH,
              zIndex: 10,
            }}
          >
            {fields.map((f) => {
              const style: React.CSSProperties = {
                position: "absolute",
                left: f.x * scale,
                top: f.y * scale,
                width: f.w * scale,
                height: f.h * scale,
              };

              // ===== CAPTURE MODE: input 없이 "그림"으로만 =====
              if (mode === "capture") {
                if (f.type === "checkbox") {
                  const checked = values[f.key] === "1";
                  return (
                    <div key={f.key} style={style}>
                      {checked ? (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#000",
                          }}
                        >
                          ✓
                        </div>
                      ) : null}
                    </div>
                  );
                }

                if (f.type === "signature") {
                  return (
                    <div key={f.key} style={style}>
                      {values.signature ? (
                        <img
                          src={values.signature}
                          alt="signature"
                          draggable={false}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : null}
                    </div>
                  );
                }

                return (
                  <div key={f.key} style={style}>
                    <span style={captureTextStyle}>{values[f.key] ?? ""}</span>
                  </div>
                );
              }

              // ===== EDIT MODE: 기존 input =====
              if (f.type === "checkbox") {
                const checked = values[f.key] === "1";
                return (
                  <input
                    key={f.key}
                    type="checkbox"
                    style={{ ...style, accentColor: "#000" }}
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
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "1px solid #d1d5db",
                          background: "rgba(255,255,255,0.7)",
                        }}
                        onClick={() => setSignOpen(true)}
                        title="클릭해서 서명 수정"
                      >
                        <img
                          src={values.signature}
                          alt="signature"
                          draggable={false}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "1px solid #d1d5db",
                          background: "rgba(255,255,255,0.7)",
                          fontSize: 10,
                          color: "#4b5563",
                        }}
                        onClick={() => setSignOpen(true)}
                      >
                        서명
                      </button>
                    )}

                    {signOpen && (
                      <div
                        style={{
                          position: "fixed",
                          inset: 0,
                          zIndex: 60,
                          background: "rgba(0,0,0,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            width: 520,
                            maxWidth: "calc(100vw - 32px)",
                            borderRadius: 12,
                            background: "#fff",
                            padding: 16,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                            <p style={{ fontSize: 14, fontWeight: 600 }}>서명 입력</p>
                            <button type="button" style={{ fontSize: 14, color: "#4b5563" }} onClick={() => setSignOpen(false)}>
                              닫기
                            </button>
                          </div>

                          <SignaturePad
                            width={480}
                            height={200}
                            onEnd={(img) => onChange({ ...values, signature: img })}
                            onClear={() => onChange({ ...values, signature: "" })}
                          />

                          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            <Button variant="outline" onClick={() => onChange({ ...values, signature: "" })}>
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
                  value={values[f.key]}
                  onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
                  style={{
                    ...style,
                    border: "1px solid #d1d5db",
                    background: "rgba(255,255,255,0.7)",
                    padding: "0 4px",
                    fontSize: 11,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
