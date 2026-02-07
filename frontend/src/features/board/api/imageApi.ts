import { api, ApiError } from "@/shared/api/client";

export type ImageApiErrorType = "unauthenticated" | "forbidden" | "server_error" | "unknown";

export class ImageApiError extends Error {
    status: number;
    type: ImageApiErrorType;

    constructor(type: ImageApiErrorType, status: number, message: string) {
        super(message);
        this.name = "ImageApiError";
        this.type = type;
        this.status = status;
    }
}

const DEFAULT_ERROR_MESSAGE = "이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.";

function toImageApiError(error: unknown): ImageApiError {
    if (error instanceof ImageApiError) return error;

    if (error instanceof ApiError) {
        const status = error.status;
        if (status === 401) return new ImageApiError("unauthenticated", status, "로그인이 필요합니다.");
        if (status === 403) return new ImageApiError("forbidden", status, "권한이 없습니다.");
        if (status >= 500) return new ImageApiError("server_error", status, DEFAULT_ERROR_MESSAGE);
        return new ImageApiError("unknown", status, error.message || DEFAULT_ERROR_MESSAGE);
    }

    if (error instanceof Error) {
        return new ImageApiError("unknown", 0, error.message || DEFAULT_ERROR_MESSAGE);
    }

    return new ImageApiError("unknown", 0, DEFAULT_ERROR_MESSAGE);
}

type UploadResponse = {
    url?: unknown;
    message?: unknown;
};

const safeString = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function uploadBoardImage(file: File): Promise<string> {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const data = await api<UploadResponse>(`/images/upload`, {
            method: "POST",
            body: formData,
        });

        const url = safeString(data?.url);
        if (!url) throw new Error("이미지 업로드 응답에 url이 없습니다.");
        return url;
    } catch (error) {
        throw toImageApiError(error);
    }
}
