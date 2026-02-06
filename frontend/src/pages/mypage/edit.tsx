import { useEffect, useState } from "react";
import { fetchMyInfo } from "@/features/member/api/memberApi";
import type { MemberMeResponse } from "@/features/member/types";
import { Button } from "@/shared/ui/button";

export default function MyPageEdit() {
    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState<MemberMeResponse | null>(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        fetchMyInfo()
            .then((data) => {
                setMember(data);
                setName(data.name ?? "");
                setPhone(data.phone ?? "");
                setAddress(data.address ?? "");
            })
            .finally(() => setLoading(false));
    }, []);

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

                <Button
                    type="button"
                    onClick={() => {
                        console.log({ name, phone, address });
                    }}
                >
                    저장 (아직 동작 안 함)
                </Button>
            </div>
        </section>
    );
}
