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
                // 서버에서 메시지 내려주는 구조면 여기서 파싱 가능
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
            <section className="px-6 py-16 text-sm text-gray-500">
                불러오는 중...
            </section>
        );
    }

    if (!member) {
        return (
            <section className="px-6 py-16 text-sm text-red-500">
                회원 정보를 불러오지 못했습니다.
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-[800px] px-6 py-16 space-y-6">
            <h1 className="text-2xl font-semibold">내 정보 수정</h1>

            <div className="rounded-xl border bg-white p-6 space-y-4">
                {errorMsg && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errorMsg}
                    </div>
                )}

                {/* 이름 */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">이름</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                </div>

                {/* 전화번호 */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">전화번호</label>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                </div>

                {/* 주소 */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">주소</label>
                    <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate("/mypage")}>
                        취소
                    </Button>

                    <Button type="button" onClick={handleSave} disabled={saving}>
                        {saving ? "저장 중..." : "저장"}
                    </Button>
                </div>
            </div>
        </section>
    );
}