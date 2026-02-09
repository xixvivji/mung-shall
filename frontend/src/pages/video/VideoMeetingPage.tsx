import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { OpenVidu } from "openvidu-browser";
import { createOpenViduConnection, createOpenViduSession } from "@/features/video-call/api/openViduApi";

type StepKey = 30 | 60 | 90;

const STEPS: { stepKey: StepKey; title: string }[] = [
  { stepKey: 30, title: "1차 화상 상담 진행" },
  { stepKey: 60, title: "2차 화상 상담 진행" },
  { stepKey: 90, title: "최종 화상 상담 진행" },
];

type StreamManagerLike = {
  addVideoElement: (element: HTMLVideoElement) => void;
  stream?: {
    connection?: {
      connectionId?: string;
      data?: string;
    };
  };
};

type SessionLike = {
  on: (eventName: string, handler: (event: any) => void) => void;
  connect: (token: string, metadata?: any) => Promise<void>;
  publish: (publisher: StreamManagerLike) => Promise<void> | void;
  subscribe: (stream: any, targetElement?: string | HTMLElement) => StreamManagerLike;
  disconnect: () => void;
};

type PublisherLike = StreamManagerLike & {
  publishAudio: (enabled: boolean) => void;
  publishVideo: (enabled: boolean) => void;
};

type VideoMeetingLocationState = {
  sessionId?: string;
  token?: string;
  clientData?: string;
  postAdoptionId?: number;
  month?: number;
  role?: string;
  autoJoin?: boolean;
};

function titleForStepKey(stepKey?: string) {
  const n = Number(stepKey);
  if (!Number.isNaN(n)) {
    if (n === 30) return "1차 화상 상담";
    if (n === 60) return "2차 화상 상담";
    if (n === 90) return "최종 화상 상담";
  }
  return "화상 상담";
}

function toStepKey(value?: string): StepKey | null {
  const n = Number(value);
  if (n === 30 || n === 60 || n === 90) return n;
  return null;
}

function parseClientData(raw?: string) {
  if (!raw) return "참여자";
  const payload = raw.includes("%/%") ? raw.split("%/%").pop() : raw;
  if (!payload) return "참여자";
  try {
    const parsed = JSON.parse(payload);
    if (parsed && typeof parsed.clientData === "string" && parsed.clientData.trim()) {
      return parsed.clientData;
    }
  } catch {
    // ignore malformed metadata and fallback
  }
  return "참여자";
}

function VideoTile({
                     streamManager,
                     title,
                   }: {
  streamManager: StreamManagerLike;
  title: string;
}) {
  const videoRef = useCallback(
      (element: HTMLVideoElement | null) => {
        if (!element) return;
        streamManager.addVideoElement(element);
      },
      [streamManager]
  );

  return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-900">
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-[240px] w-full bg-black object-cover"
        />
        <div className="px-3 py-2 text-sm font-medium text-gray-100">{title}</div>
      </div>
  );
}

export default function VideoMeetingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { postAdoptionId, stepOrder } = useParams<{
    postAdoptionId: string;
    stepOrder: string;
  }>();
  const locationState = (location.state as VideoMeetingLocationState | null) ?? null;

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localPublisher, setLocalPublisher] = useState<PublisherLike | null>(null);
  const [subscribers, setSubscribers] = useState<StreamManagerLike[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const [session, setSession] = useState<SessionLike | null>(null);
  const sessionRef = useRef<SessionLike | null>(null);
  const autoJoinAttemptedRef = useRef(false);

  const stepKeyParam = stepOrder;
  const pageTitle = useMemo(() => titleForStepKey(stepKeyParam), [stepKeyParam]);
  const currentStepKey = useMemo(() => toStepKey(stepKeyParam), [stepKeyParam]);
  const prefetchedSessionId = useMemo(
    () => (typeof locationState?.sessionId === "string" ? locationState.sessionId : null),
    [locationState?.sessionId]
  );
  const prefetchedClientData = useMemo(
    () => (typeof locationState?.clientData === "string" && locationState.clientData.trim() ? locationState.clientData : "WebUser"),
    [locationState?.clientData]
  );
  const prefetchedRole = useMemo(
    () => (typeof locationState?.role === "string" ? locationState.role.toLowerCase() : ""),
    [locationState?.role]
  );
  const isShelterRole = prefetchedRole === "shelter" || prefetchedRole === "center";
  const prefetchedTokenRef = useRef<string | null>(
    typeof locationState?.token === "string" && locationState.token.trim()
      ? locationState.token
      : null
  );

  const sessionId = useMemo(() => {
    if (prefetchedSessionId) return prefetchedSessionId;
    if (!postAdoptionId || !currentStepKey) return null;
    return `postcare_${postAdoptionId}_${currentStepKey}`;
  }, [postAdoptionId, currentStepKey, prefetchedSessionId]);

  const handleGo = (targetStepKey: StepKey) => {
    if (!postAdoptionId) return;
    navigate(`/video/${postAdoptionId}/${targetStepKey}`);
  };

  const leaveSession = useCallback(() => {
    const currentSession = sessionRef.current;
    try {
      currentSession?.disconnect();
    } catch {
      // ignore
    }

    sessionRef.current = null;
    setSession(null);
    setLocalPublisher(null);
    setSubscribers([]);
    setIsConnected(false);
    setAudioEnabled(true);
    setVideoEnabled(true);
  }, []);

  const handleJoin = useCallback(async () => {
    if (!sessionId) {
      setErrorMessage("잘못된 접근입니다. stepKey/postAdoptionId를 확인해주세요.");
      return;
    }

    if (import.meta.env.DEV) {
      console.debug("[call] joining video room", {
        sessionId,
        hasPrefetchedToken: Boolean(prefetchedTokenRef.current),
        isShelterRole,
      });
    }

    setIsConnecting(true);
    setErrorMessage(null);

    try {
      let token = prefetchedTokenRef.current;
      if (!token) {
        if (isShelterRole) {
          await createOpenViduSession(sessionId);
        }
        token = await createOpenViduConnection(sessionId, {
          role: "PUBLISHER",
          clientData: prefetchedClientData,
        });
      }

      const openVidu = new OpenVidu() as any;
      const newSession = openVidu.initSession();

      newSession.on("streamCreated", (event: any) => {
        const subscriber = newSession.subscribe(event.stream, undefined);
        setSubscribers((prev) => [...prev, subscriber]);
      });

      newSession.on("streamDestroyed", (event: any) => {
        const cid = event.stream?.connection?.connectionId;
        if (!cid) return;
        setSubscribers((prev) => prev.filter((sm) => sm.stream?.connection?.connectionId !== cid));
      });

      await newSession.connect(token, { clientData: prefetchedClientData });

      const publisher = await openVidu.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: "1280x720",
        frameRate: 30,
        mirror: false,
      });

      await newSession.publish(publisher);

      sessionRef.current = newSession;
      setSession(newSession);
      setLocalPublisher(publisher);
      setIsConnected(true);
      prefetchedTokenRef.current = null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "화상 연결에 실패했습니다.";
      setErrorMessage(message);
      leaveSession();
    } finally {
      setIsConnecting(false);
    }
  }, [isShelterRole, leaveSession, prefetchedClientData, sessionId]);

  const handleToggleAudio = useCallback(() => {
    if (!localPublisher) return;
    const next = !audioEnabled;
    localPublisher.publishAudio(next);
    setAudioEnabled(next);
  }, [audioEnabled, localPublisher]);

  const handleToggleVideo = useCallback(() => {
    if (!localPublisher) return;
    const next = !videoEnabled;
    localPublisher.publishVideo(next);
    setVideoEnabled(next);
  }, [localPublisher, videoEnabled]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    const hasPrefetchedToken =
      typeof locationState?.token === "string" && locationState.token.trim().length > 0;
    const shouldAutoJoin = hasPrefetchedToken || locationState?.autoJoin === true;
    if (!shouldAutoJoin) return;
    if (!sessionId) return;
    if (isConnected || isConnecting) return;
    if (autoJoinAttemptedRef.current) return;

    if (import.meta.env.DEV) {
      console.debug("[call] auto-join trigger", {
        sessionId,
        hasPrefetchedToken,
        autoJoin: locationState?.autoJoin === true,
      });
    }

    autoJoinAttemptedRef.current = true;
    void handleJoin();
  }, [handleJoin, isConnected, isConnecting, locationState?.autoJoin, locationState?.token, sessionId]);

  useEffect(() => {
    return () => {
      leaveSession();
    };
  }, [leaveSession]);

  return (
      <section className="mx-auto max-w-[1200px] space-y-6 px-6 py-16">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>

          <Link to="/mypage">
            <Button variant="outline" className="rounded-lg">
              마이페이지로 돌아가기
            </Button>
          </Link>
        </div>

        <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {STEPS.map((s) => {
              const isCurrent = currentStepKey === s.stepKey;
              return (
                  <Button
                      key={s.stepKey}
                      variant={isCurrent ? "default" : "outline"}
                      className="rounded-lg"
                      onClick={() => handleGo(s.stepKey)}
                  >
                    {s.title}
                  </Button>
              );
            })}
          </div>

          {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {/* 연결 전: 파란색(마이페이지 톤) 활성 / 연결 후: "연결됨" 표시 + 비활성 */}
            <Button
                variant="mypage"
                onClick={handleJoin}
                disabled={isConnecting || isConnected || !sessionId}
            >
              {isConnecting ? "연결 중..." : isConnected ? "연결됨" : "화상 연결 시작"}
            </Button>

            {/* 연결 후에만 활성 + 첫 버튼과 동일한 톤 */}
            <Button
                variant={isConnected ? "mypage" : "outline"}
                onClick={leaveSession}
                disabled={!isConnected}
            >
              연결 종료
            </Button>

            <Button
                variant={isConnected ? "mypage" : "outline"}
                onClick={handleToggleAudio}
                disabled={!isConnected}
            >
              {audioEnabled ? "마이크 끄기" : "마이크 켜기"}
            </Button>

            <Button
                variant={isConnected ? "mypage" : "outline"}
                onClick={handleToggleVideo}
                disabled={!isConnected}
            >
              {videoEnabled ? "카메라 끄기" : "카메라 켜기"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {localPublisher ? <VideoTile streamManager={localPublisher} title="나" /> : null}

            {subscribers.map((subscriber, index) => {
              const connectionId =
                  subscriber.stream?.connection?.connectionId ?? `subscriber-${index + 1}`;
              const name = parseClientData(subscriber.stream?.connection?.data);
              return <VideoTile key={connectionId} streamManager={subscriber} title={name} />;
            })}

            {!localPublisher && subscribers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-gray-600 md:col-span-2">
                  연결을 시작하면 내 영상과 상대방 영상이 여기에 표시됩니다.
                </div>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="rounded-lg" onClick={() => window.history.back()}>
              뒤로가기
            </Button>
          </div>
        </div>
      </section>
  );
}
