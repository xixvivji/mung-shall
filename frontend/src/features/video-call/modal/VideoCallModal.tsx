import { useEffect, useRef } from "react";
import { useVideoCall } from "../hooks/useVideoCall";
import { ControlBar } from "../ui/ControlBar";
import { VideoStage } from "../ui/VideoStorage";

export type VideoCallModalProps = {
  open: boolean;
  onClose: () => void;
  roomId?: string;
};

export const VideoCallModal = ({
  open,
  onClose,
  roomId,
}: VideoCallModalProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);
  const { participants, micOn, videoOn, toggleMic, toggleVideo, join, leave } =
    useVideoCall();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      join(roomId ?? "default-room");
      return;
    }
    leave();
  }, [open, join, leave, roomId]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    prevActiveRef.current = document.activeElement as HTMLElement | null;
    window.setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = originalOverflow;
      prevActiveRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 px-4 py-6"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#0f1115] text-white shadow-2xl outline-none"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-sm text-white/60">화상 상담</p>
            <h2 className="text-lg font-semibold">Video Call</h2>
          </div>
          {roomId ? (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              Room {roomId}
            </span>
          ) : null}
        </header>

        <div className="flex-1 px-4 py-4">
          <VideoStage participants={participants} />
        </div>

        <footer className="border-t border-white/10 px-4 py-4">
          <ControlBar
            micOn={micOn}
            videoOn={videoOn}
            onToggleMic={toggleMic}
            onToggleVideo={toggleVideo}
            onLeave={() => {
              leave();
              onClose();
            }}
          />
        </footer>
      </div>
    </div>
  );
};
