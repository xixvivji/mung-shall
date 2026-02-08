import { api } from "@/shared/api/client";

type OpenViduConnectionOptions = {
  role?: "SUBSCRIBER" | "PUBLISHER" | "MODERATOR";
  clientData?: string;
};

function extractStringResponse(data: unknown, fallbackKeys: string[]): string {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of fallbackKeys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  throw new Error("OpenVidu API 응답에서 문자열 값을 찾지 못했습니다.");
}

export async function createOpenViduSession(customSessionId: string): Promise<string> {
  const data = await api<unknown>("/openvidu/sessions", {
    method: "POST",
    body: JSON.stringify({ customSessionId }),
  });
  return extractStringResponse(data, ["sessionId", "id"]);
}

export async function createOpenViduConnection(
  sessionId: string,
  options: OpenViduConnectionOptions = {}
): Promise<string> {
  const role = options.role ?? "PUBLISHER";
  const clientData = options.clientData ?? "WebUser";
  const data = await api<unknown>(`/openvidu/sessions/${encodeURIComponent(sessionId)}/connections`, {
    method: "POST",
    body: JSON.stringify({
      role,
      data: JSON.stringify({ clientData }),
    }),
  });
  return extractStringResponse(data, ["token"]);
}

export async function openRoom(
  postAdoptionId: number,
  month: number,
  sessionId: string
): Promise<void> {
  await api<void>(`/post-adoptions/${postAdoptionId}/video-calls/${month}/open-room`, {
    method: "PATCH",
    body: JSON.stringify({ openViduSessionId: sessionId }),
  });
}

export async function createSession(customSessionId: string): Promise<{ sessionId: string }> {
  const sessionId = await createOpenViduSession(customSessionId);
  return { sessionId };
}

export async function createConnection(
  sessionId: string,
  options: OpenViduConnectionOptions = {}
): Promise<{ token: string }> {
  const token = await createOpenViduConnection(sessionId, options);
  return { token };
}
