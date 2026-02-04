import type { ReactNode } from "react";

export type ControlBarProps = {
  micOn: boolean;
  videoOn: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
};

const ControlButton = ({
  active,
  onClick,
  children,
  danger,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={
      danger
        ? "rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-400"
        : active
        ? "rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
        : "rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-white/70 hover:bg-white/10"
    }
  >
    {children}
  </button>
);

export const ControlBar = ({
  micOn,
  videoOn,
  onToggleMic,
  onToggleVideo,
  onLeave,
}: ControlBarProps) => (
  <div className="flex items-center justify-center gap-4">
    <ControlButton active={micOn} onClick={onToggleMic}>
      {micOn ? "마이크 켜짐" : "마이크 꺼짐"}
    </ControlButton>
    <ControlButton active={videoOn} onClick={onToggleVideo}>
      {videoOn ? "카메라 켜짐" : "카메라 꺼짐"}
    </ControlButton>
    <ControlButton danger onClick={onLeave}>
      나가기
    </ControlButton>
    {/* TODO: 추후 화면공유/채팅 아이콘 자리 */}
  </div>
);
