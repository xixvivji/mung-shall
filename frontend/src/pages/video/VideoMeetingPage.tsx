import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { api } from "@/shared/api/client";
import { OpenVidu } from "openvidu-browser";

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

async function createOpenViduSession(sessionId: string) {
  return api<string>("/openvidu/sessions", {
    method: "POST",
    body: JSON.stringify({ customSessionId: sessionId }),
  });
}

async function createOpenViduToken(sessionId: string, clientData: string) {
  return api<string>(`/openvidu/sessions/${encodeURIComponent(sessionId)}/connections`, {
    method: "POST",
    body: JSON.stringify({
      role: "PUBLISHER",
      data: JSON.stringify({ clientData }),
    }),
  });
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
      <video ref={videoRef} autoPlay playsInline className="h-[240px] w-full bg-black object-cover" />
      <div className="px-3 py-2 text-sm font-medium text-gray-100">{title}</div>
    </div>
  );
}

export default function VideoMeetingPage() {
  const navigate = useNavigate();
  const { postAdoptionId, stepOrder } = useParams<{
    postAdoptionId: string;
    stepOrder: string;
  }>();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localPublisher, setLocalPublisher] = useState<PublisherLike | null>(null);
  const [subscribers, setSubscribers] = useState<StreamManagerLike[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const [session, setSession] = useState<SessionLike | null>(null);

  const stepKeyParam = stepOrder;
  const pageTitle = useMemo(() => titleForStepKey(stepKeyParam), [stepKeyParam]);
  const currentStepKey = useMemo(() => toStepKey(stepKeyParam), [stepKeyParam]);

  const sessionId = useMemo(() => {
    if (!postAdoptionId || !currentStepKey) return null;
    return `postcare_${postAdoptionId}_${currentStepKey}`;
  }, [postAdoptionId, currentStepKey]);

  const handleGo = (targetStepKey: StepKey) => {
    if (!postAdoptionId) return;
    navigate(`/video/${postAdoptionId}/${targetStepKey}`);
  };

  const leaveSession = useCallback(() => {
    if (session) {
      session.disconnect();
    }
    setSession(null);
    setLocalPublisher(null);
    setSubscribers([]);
    setIsConnected(false);
    setAudioEnabled(true);
    setVideoEnabled(true);
  }, [session]);

  const handleJoin = useCallback(async () => {
    if (!sessionId) {
      setErrorMessage("잘못된 접근입니다. stepKey/postAdoptionId를 확인해주세요.");
      return;
    }

    setIsConnecting(true);
    setErrorMessage(null);

    try {
      await createOpenViduSession(sessionId);
      const token = await createOpenViduToken(sessionId, "WebUser");
      const openVidu = new OpenVidu() as any;
      const newSession = openVidu.initSession();

      newSession.on("streamCreated", (event: any) => {
        const subscriber = newSession.subscribe(event.stream, undefined);
        setSubscribers((prev) => [...prev, subscriber]);
      });

      newSession.on("streamDestroyed", (event: any) => {
        const targetStreamManager = event.stream?.streamManager;
        setSubscribers((prev) => prev.filter((item) => item !== targetStreamManager));
      });

      await newSession.connect(token, { clientData: "WebUser" });

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
      setSession(newSession);
      setLocalPublisher(publisher);
      setIsConnected(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "화상 연결에 실패했습니다.";
      setErrorMessage(message);
      leaveSession();
    } finally {
      setIsConnecting(false);
    }
  }, [leaveSession, sessionId]);

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

  useEffect(() => () => leaveSession(), [leaveSession]);

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
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div>
            postAdoptionId: <span className="font-semibold text-gray-900">{postAdoptionId ?? "-"}</span>
          </div>
          <div>
            stepKey: <span className="font-semibold text-gray-900">{stepKeyParam ?? "-"}</span>
          </div>
          <div>
            sessionId: <span className="font-semibold text-gray-900">{sessionId ?? "-"}</span>
          </div>
        </div>

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
          <Button
            className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleJoin}
            disabled={isConnecting || isConnected || !sessionId}
          >
            {isConnecting ? "연결 중..." : isConnected ? "연결됨" : "화상 연결 시작"}
          </Button>
          <Button variant="outline" className="rounded-lg" onClick={leaveSession} disabled={!isConnected}>
            연결 종료
          </Button>
          <Button variant="outline" className="rounded-lg" onClick={handleToggleAudio} disabled={!isConnected}>
            {audioEnabled ? "마이크 끄기" : "마이크 켜기"}
          </Button>
          <Button variant="outline" className="rounded-lg" onClick={handleToggleVideo} disabled={!isConnected}>
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
