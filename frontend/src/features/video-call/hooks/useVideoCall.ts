import { useCallback, useMemo, useRef, useState } from "react";

export type VideoCallParticipant = {
  id: string;
  name: string;
  isLocal: boolean;
  videoOn: boolean;
  micOn: boolean;
  avatarUrl?: string;
};

export type VideoCallLayout = "grid" | "speaker";

export type UseVideoCallReturn = {
  open: boolean;
  setOpen: (open: boolean) => void;
  participants: VideoCallParticipant[];
  micOn: boolean;
  videoOn: boolean;
  toggleMic: () => void;
  toggleVideo: () => void;
  join: (roomId: string) => void;
  leave: () => void;
  layout: VideoCallLayout;
  setLayout: (layout: VideoCallLayout) => void;
  roomId?: string;
};

const createMockParticipants = (micOn: boolean, videoOn: boolean): VideoCallParticipant[] => [
  {
    id: "local-1",
    name: "나",
    isLocal: true,
    videoOn,
    micOn,
  },
  {
    id: "remote-1",
    name: "김민지",
    isLocal: false,
    videoOn: true,
    micOn: true,
  },
  {
    id: "remote-2",
    name: "Alex",
    isLocal: false,
    videoOn: false,
    micOn: true,
  },
  {
    id: "remote-3",
    name: "박서준",
    isLocal: false,
    videoOn: true,
    micOn: false,
  },
];

export const useVideoCall = (): UseVideoCallReturn => {
  const [open, setOpen] = useState(false);
  const [participants, setParticipants] = useState<VideoCallParticipant[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [layout, setLayout] = useState<VideoCallLayout>("grid");
  const roomIdRef = useRef<string | undefined>(undefined);

  const updateLocalParticipant = useCallback(
    (updates: Partial<VideoCallParticipant>) => {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.isLocal ? { ...participant, ...updates } : participant
        )
      );
    },
    []
  );

  const toggleMic = useCallback(() => {
    setMicOn((prev) => {
      const next = !prev;
      updateLocalParticipant({ micOn: next });
      return next;
    });
  }, [updateLocalParticipant]);

  const toggleVideo = useCallback(() => {
    setVideoOn((prev) => {
      const next = !prev;
      updateLocalParticipant({ videoOn: next });
      return next;
    });
  }, [updateLocalParticipant]);

  const join = useCallback(
    (roomId: string) => {
      roomIdRef.current = roomId;
      // TODO: 여기에 getUserMedia / peer connection 연결 로직을 붙일 자리
      setParticipants(createMockParticipants(micOn, videoOn));
      setOpen(true);
    },
    [micOn, videoOn]
  );

  const leave = useCallback(() => {
    // TODO: 여기에 peer connection 종료 및 media track 정리 로직을 붙일 자리
    setParticipants([]);
    setOpen(false);
    roomIdRef.current = undefined;
  }, []);

  return useMemo(
    () => ({
      open,
      setOpen,
      participants,
      micOn,
      videoOn,
      toggleMic,
      toggleVideo,
      join,
      leave,
      layout,
      setLayout,
      roomId: roomIdRef.current,
    }),
    [
      open,
      participants,
      micOn,
      videoOn,
      toggleMic,
      toggleVideo,
      join,
      leave,
      layout,
    ]
  );
};
