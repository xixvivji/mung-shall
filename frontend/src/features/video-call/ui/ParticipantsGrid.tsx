import type { VideoCallParticipant } from "../hooks/useVideoCall";

export type ParticipantsGridProps = {
  participants: VideoCallParticipant[];
};

const getGridClass = (count: number) => {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  return "grid-cols-2";
};

const getTileHeightClass = (count: number) => {
  if (count <= 2) return "h-64 md:h-72";
  return "h-56 md:h-64";
};

const Initials = ({ name }: { name: string }) => {
  const initial = name.trim().charAt(0) || "?";
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold">
      {initial}
    </div>
  );
};

export const ParticipantsGrid = ({ participants }: ParticipantsGridProps) => {
  const count = participants.length;
  const gridClass = getGridClass(count);
  const tileHeightClass = getTileHeightClass(count);

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {participants.map((participant) => (
        <div
          key={participant.id}
          className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#141822] ${tileHeightClass}`}
        >
          {participant.videoOn ? (
            <div className="h-full w-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
              <div className="absolute inset-0 flex items-center justify-center text-white/40">
                Video Stream
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-white/80">
              <Initials name={participant.name} />
              <span className="text-sm">카메라 꺼짐</span>
            </div>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            <span>{participant.name}</span>
            {participant.isLocal ? (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">나</span>
            ) : null}
            {!participant.micOn ? (
              <span className="rounded-full bg-red-500/70 px-2 py-0.5 text-[10px]">
                마이크 꺼짐
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};
