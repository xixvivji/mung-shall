export { VideoCallModal } from "./modal/VideoCallModal";
export { useVideoCall } from "./hooks/useVideoCall";
export type { VideoCallParticipant, VideoCallLayout } from "./hooks/useVideoCall";

// 사용 예시:
// const { open, setOpen } = useVideoCall();
// <VideoCallModal open={open} onClose={() => setOpen(false)} roomId="room-101" />
