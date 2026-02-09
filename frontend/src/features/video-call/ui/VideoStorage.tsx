import type { VideoCallParticipant } from "../hooks/useVideoCall";
import { ParticipantsGrid } from "./ParticipantsGrid";

export type VideoStageProps = {
  participants: VideoCallParticipant[];
};

export const VideoStage = ({ participants }: VideoStageProps) => (
  <div className="h-full rounded-2xl bg-[#0c0f16] p-4">
    <ParticipantsGrid participants={participants} />
  </div>
);
