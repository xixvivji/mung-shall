import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyInfo, updateMyInfo } from "@/features/member/api/memberApi";
import type { MemberMeResponse } from "@/features/member/types";
import { Button } from "@/shared/ui/button";
import { ApiError } from "@/shared/api/client";
import { authStore } from "@/features/auth/store/authStore";

export default function MyPageEdit() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState<MemberMeResponse | null>(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchMyInfo()
            .then((data) => {
                setMember(data);
                setName(data.name ?? "");
                setPhone(data.phone ?? "");
                setAddress(data.address ?? "");
            })
            .catch(() => {
                setMember(null);
            })
            .finally(() => setLoading(false));
    }, []);

    async function handleSave() {
        if (saving) return;

        setSaving(true);
        setErrorMsg(null);

        try {
            await updateMyInfo({
                name: name.trim(),
                phone: phone.trim() === "" ? null : phone.trim(),
                address: address.trim() === "" ? null : address.trim(),
            });

            const fresh = await fetchMyInfo();

            const prev = authStore.getSnapshot();
            authStore.setUser(prev ? { ...prev, name: fresh.name, username: fresh.username } : prev);

            alert("정보가 수정되었습니다.");
            navigate("/mypage");
        } catch (e: unknown) {
            if (e instanceof ApiError) {
                setErrorMsg("정보 수정에 실패했습니다. 입력값을 확인해주세요.");
            } else {
                setErrorMsg("정보 수정 중 오류가 발생했습니다.");
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="text-sm text-gray-500">불러오는 중...</div>
            </section>
        );
    }

    if (!member) {
        return (
            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="text-sm text-red-500">회원 정보를 불러오지 못했습니다.</div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-6xl space-y-8 px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">내 정보 수정</h2>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mx-auto max-w-2xl space-y-6">
                        {errorMsg && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {errorMsg}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">이름</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-300 focus:ring-4 focus:ring-gray-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">전화번호</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-300 focus:ring-4 focus:ring-gray-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">주소</label>
                            <input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-300 focus:ring-4 focus:ring-gray-100"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="mypage" size="sm" onClick={() => navigate("/mypage")}>
                                취소
                            </Button>

                            <Button type="button" variant="mypage" size="sm" onClick={handleSave} disabled={saving}>
                                {saving ? "저장 중..." : "저장"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
