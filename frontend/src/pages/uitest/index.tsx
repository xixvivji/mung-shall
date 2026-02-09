import { useState } from "react";

import { ContinueApplicationButton } from "@/shared/ui/uiverse/ContinueApplicationButton";
import { UiCheckbox } from "@/shared/ui/uiverse/UiCheckbox";
import { FloatingInput } from "@/shared/ui/uiverse/FloatingInput";
import { RadioTabs } from "@/shared/ui/uiverse/RadioTabs";
import { BinButton } from "@/shared/ui/uiverse/BinButton";

export default function UiVerseTestPage() {
  const [checked, setChecked] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [tab, setTab] = useState("html");

  return (
    <div style={{ padding: 32, display: "grid", gap: 32 }}>
      <h1>UIverse Test</h1>

      {/* ✅ 기본 페이지 영역 */}
      <section style={{ display: "grid", gap: 20 }}>
        <section>
          <h2>Continue Button</h2>
          <ContinueApplicationButton />
        </section>

        <section>
          <h2>Checkbox</h2>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <UiCheckbox checked={checked} onChange={setChecked} />
            동의합니다 (checked: {String(checked)})
          </label>
        </section>

        <section>
          <h2>Radio Tabs</h2>
          <RadioTabs
            name="framework"
            value={tab}
            onChange={setTab}
            options={[
              { label: "HTML", value: "html" },
              { label: "React", value: "react" },
              { label: "Vue", value: "vue" },
            ]}
          />
          <div style={{ fontSize: 12, opacity: 0.7 }}>selected: {tab}</div>
        </section>

        <section>
          <h2>Bin Button</h2>
          <BinButton onClick={() => alert("삭제 버튼 클릭")} />
        </section>
      </section>

      {/* ✅ FloatingInput 전용 테스트 영역 */}
      <section
        style={{
          background: "#212121",
          padding: 24,
          borderRadius: 12,
          maxWidth: 400,
        }}
      >
        <h2 style={{ color: "#fff", marginTop: 0 }}>Floating Input (isolated)</h2>

        <FloatingInput
          label="First Name"
          value={firstName}
          onChange={setFirstName}
          required
        />

        <div style={{ color: "#fff", opacity: 0.8, fontSize: 12, marginTop: 8 }}>
          value: {firstName || "(empty)"}
        </div>
      </section>
    </div>
  );
}
