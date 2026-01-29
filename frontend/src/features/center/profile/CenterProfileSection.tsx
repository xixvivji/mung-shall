import * as React from "react";
import { fetchCenterProfile, fetchMe, upsertCenterProfile } from "../api/centerProfileApi";
import type { CenterProfile, CenterProfileUpdateRequest } from "./types";

const EMPTY_FORM: CenterProfileUpdateRequest = {
  centerName: "",
  phoneNumber: "",
  address: "",
  description: "",
};

type Mode = "view" | "edit";

type FieldErrors = Partial<Record<keyof CenterProfileUpdateRequest, string>>;

function isNotFoundError(message: string) {
  const lowered = message.toLowerCase();
  return (
    lowered.includes("404") ||
    lowered.includes("not found") ||
    lowered.includes("존재하지 않는 경로")
  );
}

function formatError(err: unknown) {
  const message = err instanceof Error ? err.message : "요청에 실패했습니다.";
  const lowered = message.toLowerCase();
  if (
    lowered.includes("401") ||
    lowered.includes("403") ||
    lowered.includes("unauthorized") ||
    lowered.includes("forbidden")
  ) {
    return "권한이 없습니다.";
  }
  if (isNotFoundError(message)) {
    return "센터 프로필이 존재하지 않습니다.";
  }
  return message || "요청에 실패했습니다.";
}

function normalizeForm(form: CenterProfileUpdateRequest): CenterProfileUpdateRequest {
  return {
    centerName: form.centerName.trim(),
    phoneNumber: form.phoneNumber.trim(),
    address: form.address.trim(),
    description: form.description?.trim() ?? "",
  };
}

function validate(form: CenterProfileUpdateRequest): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.centerName.trim()) errors.centerName = "센터명을 입력해주세요.";
  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "연락처를 입력해주세요.";
  } else if (!/^[0-9\-\s]+$/.test(form.phoneNumber.trim())) {
    errors.phoneNumber = "연락처 형식이 올바르지 않습니다.";
  }
  if (!form.address.trim()) errors.address = "주소를 입력해주세요.";
  return errors;
}

export function CenterProfileSection() {
  const [mode, setMode] = React.useState<Mode>("view");
  const [form, setForm] = React.useState<CenterProfileUpdateRequest>(EMPTY_FORM);
  const [savedProfile, setSavedProfile] = React.useState<CenterProfile | null>(null);
  const [shelterId, setShelterId] = React.useState<number | null>(null);
  const [accessDenied, setAccessDenied] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [isNew, setIsNew] = React.useState(false);

  const isEdit = mode === "edit";
  const isReadOnly = !isEdit || loading || saving;

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchMe()
      .then((meResponse) => {
        if (!active) return;
        if (meResponse.userType !== "shelter") {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        setShelterId(meResponse.userId);
        return fetchCenterProfile(meResponse.userId);
      })
      .then((profile) => {
        if (!active || !profile) return;
        setSavedProfile(profile);
        setForm({
          centerName: profile.centerName ?? "",
          phoneNumber: profile.phoneNumber ?? "",
          address: profile.address ?? "",
          description: profile.description ?? "",
        });
        setIsNew(false);
        setMode("view");
      })
      .catch((err) => {
        if (!active) return;
        const message = err instanceof Error ? err.message : "";
        if (isNotFoundError(message)) {
          setIsNew(true);
          setMode("edit");
          setForm(EMPTY_FORM);
          setError(null);
        } else {
          setError(formatError(err));
        }
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (key: keyof CenterProfileUpdateRequest) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      if (fieldErrors[key]) {
        setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    };

  const handleEdit = () => {
    setMode("edit");
    setMessage(null);
    setError(null);
  };

  const handleCancel = () => {
    if (saving) return;
    if (savedProfile) {
      setForm({
        centerName: savedProfile.centerName ?? "",
        phoneNumber: savedProfile.phoneNumber ?? "",
        address: savedProfile.address ?? "",
        description: savedProfile.description ?? "",
      });
      setMode("view");
      setIsNew(false);
    } else {
      setForm(EMPTY_FORM);
      setMode("view");
    }
    setFieldErrors({});
    setMessage(null);
    setError(null);
  };

  const handleSave = async () => {
    if (saving) return;
    const normalized = normalizeForm(form);
    const errors = validate(normalized);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    if (!shelterId) {
      setError("센터 계정 정보가 확인되지 않습니다.");
      setSaving(false);
      return;
    }

    try {
      const updated = await upsertCenterProfile(shelterId, normalized);
      setSavedProfile(updated);
      setForm({
        centerName: updated.centerName ?? "",
        phoneNumber: updated.phoneNumber ?? "",
        address: updated.address ?? "",
        description: updated.description ?? "",
      });
      setMode("view");
      setIsNew(false);
      setMessage("센터 프로필이 저장되었습니다.");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">센터 프로필</h1>
          <p className="mt-1 text-sm text-slate-600">
            센터 정보(센터명/주소/연락처)를 확인하고 수정합니다.
          </p>
        </div>
        {!loading && !accessDenied && (
          <div className="flex gap-2">
            {isEdit ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-slate-400"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEdit}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
              >
                {isNew || !savedProfile ? "등록" : "수정"}
              </button>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          센터 프로필을 불러오는 중...
        </div>
      )}

      {accessDenied && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          센터(보호소) 계정만 센터 프로필을 열람할 수 있습니다.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {!loading && !accessDenied && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">센터명</label>
            <input
              value={form.centerName}
              onChange={handleChange("centerName")}
              readOnly={isReadOnly}
              className={[
                "h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none",
                isReadOnly ? "bg-slate-50 text-slate-500" : "bg-white",
              ].join(" ")}
            />
            {fieldErrors.centerName && (
              <p className="text-xs text-red-600">{fieldErrors.centerName}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">연락처</label>
            <input
              value={form.phoneNumber}
              onChange={handleChange("phoneNumber")}
              readOnly={isReadOnly}
              className={[
                "h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none",
                isReadOnly ? "bg-slate-50 text-slate-500" : "bg-white",
              ].join(" ")}
            />
            {fieldErrors.phoneNumber && (
              <p className="text-xs text-red-600">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">주소</label>
            <input
              value={form.address}
              onChange={handleChange("address")}
              readOnly={isReadOnly}
              className={[
                "h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none",
                isReadOnly ? "bg-slate-50 text-slate-500" : "bg-white",
              ].join(" ")}
            />
            {fieldErrors.address && (
              <p className="text-xs text-red-600">{fieldErrors.address}</p>
            )}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">소개 / 설명</label>
            <textarea
              value={form.description ?? ""}
              onChange={handleChange("description")}
              readOnly={isReadOnly}
              rows={4}
              className={[
                "w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none",
                isReadOnly ? "bg-slate-50 text-slate-500" : "bg-white",
              ].join(" ")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
