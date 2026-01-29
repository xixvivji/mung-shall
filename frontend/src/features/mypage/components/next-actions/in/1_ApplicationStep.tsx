import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { submitAdoptionApplication } from "@/features/adoptionApplication/api";
import type { AdoptionApplicationRequest } from "@/features/adoptionApplication/types";

type Props = {
  isEditable: boolean;
  onSubmitSuccess: () => void;
};

type Gender = "MALE" | "FEMALE" | "OTHER";
type PetPreference = "ADULT_DOG" | "PUPPY" | "ANY";
type ResidenceType =
  | "MULTI_FAMILY_HOUSE"
  | "SINGLE_FAMILY_HOUSE"
  | "APARTMENT"
  | "STUDIO_APARTMENT"
  | "OTHER";
type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "OTHER";
type MonthlyExpenseRange =
  | "RANGE_0_5"
  | "RANGE_5_10"
  | "RANGE_10_20"
  | "RANGE_20_UP"
  | "NOT_SURE";

type EmergencyContact = {
  contactName: string;
  contactPhoneNumber: string;
  relationship: string;
};

type CohabitantDetail = {
  relationship: string;
  age: number | "";
  hasAllergy: boolean;
  adoptionAgreement: boolean;
};

type CurrentPetDetail = {
  petType: string;
  breed: string;
  count: number | "";
  age: number | "";
  neutered: boolean;
  reasonForAdoptingMore: string;
};

type PastPetExperience = {
  pastPetType: string;
  pastPetCount: number | "";
  duration: string;
  isCurrentlyWithYou: boolean;
  details: string;
};

type Form = {
  name: string;
  dateOfBirth: string; // yyyy-mm-dd
  gender: Gender | "";
  phoneNumber: string;
  email: string;
  address: string;
  detailAddress: string;

  emergencyContacts: EmergencyContact[];

  petPreference: PetPreference | "";
  cohabitantAgreement: boolean;
  hasCohabitant: boolean;

  cohabitantComposition: {
    numberOfAdults: number | "";
    numberOfChildren: number | "";
  };

  cohabitantDetails: CohabitantDetail[];

  hasCurrentPets: boolean;
  currentPetDetails: CurrentPetDetail[];

  hasPastPetExperience: boolean;
  pastPetExperiences: PastPetExperience[];

  residenceType: ResidenceType | "";
  isOwner: boolean;
  completedOwnerEducation: boolean;

  agreesToLifetimeCommitment: boolean;
  agreesToFollowUp: boolean;

  job: string;
  workingHours: string;
  aloneTimeManagement: string;
  maritalStatus: MaritalStatus | "";

  petLivingSpaceLocation: string;
  petLivingSpacePhotoUrl: string;

  monthlyExpenseRange: MonthlyExpenseRange | "";
  agreesToNeutering: boolean;

  motivationForAdoption: string;
  lifeChangeCopingPlan: string;
  travelCopingPlan: string;

  agreesToRegularUpdates: boolean;
  additionalQuestions: string;
};

type Errors = Record<string, string>;

const APPLICATION_ID_KEY = "adoptionApplicationId";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isValidPhone(v: string) {
  const x = v.replaceAll("-", "").trim();
  return /^01[0-9]\d{7,8}$/.test(x);
}
function todayISO() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function trimAll(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function Field({
  label,
  required = true,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </p>
        {hint ? <span className="text-xs text-gray-400">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder = "선택",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  value,
  onChange,
  disabled,
  labels = ["아니오", "예"],
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  labels?: [string, string];
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => onChange(false)}
        disabled={disabled}
        className={`h-10 px-4 text-sm ${
          !value ? "bg-gray-900 text-white" : "text-gray-700"
        } disabled:opacity-60`}
      >
        {labels[0]}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        disabled={disabled}
        className={`h-10 px-4 text-sm ${
          value ? "bg-gray-900 text-white" : "text-gray-700"
        } disabled:opacity-60`}
      >
        {labels[1]}
      </button>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-gray-900"
      />
      {label}
    </label>
  );
}

/** ====== 스텝 정의 ====== */
type StepId =
  | "BASIC_INFO"
  | "EMERGENCY"
  | "PET_PREF"
  | "COHAB"
  | "CURRENT_PETS"
  | "PAST_PETS"
  | "RESIDENCE"
  | "JOB_LIFE"
  | "PET_SPACE"
  | "REQUIRED_CONSENTS"
  | "COST_NEUTERING"
  | "MOTIVATION_PLAN"
  | "EXTRA_QUESTIONS";

const STEPS: { id: StepId; title: string; desc: string }[] = [
  { id: "BASIC_INFO", title: "기본 정보", desc: "이름/생년월일/연락처 등을 입력해요." },
  { id: "EMERGENCY", title: "비상연락망", desc: "비상연락처 정보를 입력해요." },
  { id: "PET_PREF", title: "입양 희망", desc: "희망하는 반려동물 정보를 선택해요." },
  { id: "COHAB", title: "동거인", desc: "동거인 구성과 동의 정보를 입력해요." },
  { id: "CURRENT_PETS", title: "현재 반려동물", desc: "현재 반려동물 정보를 입력해요." },
  { id: "PAST_PETS", title: "과거 양육 경험", desc: "과거 양육 경험 정보를 입력해요." },
  { id: "RESIDENCE", title: "주거 형태", desc: "주거 형태와 소유 여부 등을 입력해요." },
  { id: "JOB_LIFE", title: "직업/생활 패턴", desc: "직업과 생활 패턴을 입력해요." },
  { id: "PET_SPACE", title: "반려 공간", desc: "반려 공간과 사진 URL을 입력해요." },
  { id: "REQUIRED_CONSENTS", title: "필수 동의", desc: "필수 동의 항목을 체크해요." },
  { id: "COST_NEUTERING", title: "비용/중성화", desc: "예상 비용과 중성화 동의를 입력해요." },
  { id: "MOTIVATION_PLAN", title: "동기/계획", desc: "입양 동기와 계획을 입력해요." },
  { id: "EXTRA_QUESTIONS", title: "추가 질문/전달사항", desc: "추가 질문이나 전달사항을 입력해요." },
];

function pickErrors(all: Errors, prefixes: string[]) {
  const out: Errors = {};
  for (const [k, v] of Object.entries(all)) {
    if (
      prefixes.some(
        (p) => k === p || k.startsWith(p + ".") || k.startsWith(p + "[")
      )
    ) {
      out[k] = v;
    }
  }
  return out;
}

export function ApplicationStep({ isEditable, onSubmitSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<Form>({
    name: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    address: "",
    detailAddress: "",

    emergencyContacts: [{ contactName: "", contactPhoneNumber: "", relationship: "" }],

    petPreference: "",
    cohabitantAgreement: false,
    hasCohabitant: true,

    cohabitantComposition: { numberOfAdults: "", numberOfChildren: "" },
    cohabitantDetails: [
      { relationship: "", age: "", hasAllergy: false, adoptionAgreement: false },
    ],

    hasCurrentPets: false,
    currentPetDetails: [
      {
        petType: "",
        breed: "",
        count: "",
        age: "",
        neutered: false,
        reasonForAdoptingMore: "",
      },
    ],

    hasPastPetExperience: false,
    pastPetExperiences: [
      {
        pastPetType: "",
        pastPetCount: "",
        duration: "",
        isCurrentlyWithYou: false,
        details: "",
      },
    ],

    residenceType: "",
    isOwner: false,
    completedOwnerEducation: false,
    agreesToLifetimeCommitment: false,
    agreesToFollowUp: false,

    job: "",
    workingHours: "",
    aloneTimeManagement: "",
    maritalStatus: "",

    petLivingSpaceLocation: "",
    petLivingSpacePhotoUrl: "",

    monthlyExpenseRange: "",
    agreesToNeutering: false,

    motivationForAdoption: "",
    lifeChangeCopingPlan: "",
    travelCopingPlan: "",

    agreesToRegularUpdates: false,
    additionalQuestions: "",
  });

  const activeStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const errorCount = useMemo(() => Object.keys(errors).length, [errors]);

  function setField<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /** ====== 전체 검증(최종 저장) ====== */
  function validateAll(next: Form): Errors {
    const e: Errors = {};

    // 1) 기본
    if (!trimAll(next.name)) e["name"] = "이름을 입력해 주세요.";
    if (!next.dateOfBirth) e["dateOfBirth"] = "생년월일을 선택해 주세요.";
    if (next.dateOfBirth && next.dateOfBirth > todayISO())
      e["dateOfBirth"] = "생년월일은 미래 날짜가 될 수 없어요.";

    if (!next.gender) e["gender"] = "성별을 선택해 주세요.";
    if (!trimAll(next.phoneNumber)) e["phoneNumber"] = "연락처를 입력해 주세요.";
    else if (!isValidPhone(next.phoneNumber))
      e["phoneNumber"] = "휴대폰 번호 형식이 올바르지 않아요.";

    if (!trimAll(next.email)) e["email"] = "이메일을 입력해 주세요.";
    else if (!isValidEmail(next.email)) e["email"] = "이메일 형식이 올바르지 않아요.";

    if (!trimAll(next.address)) e["address"] = "주소를 입력해 주세요.";
    if (!trimAll(next.detailAddress)) e["detailAddress"] = "상세주소를 입력해 주세요.";

    // 2) 비상연락망
    if (!next.emergencyContacts?.length)
      e["emergencyContacts"] = "비상연락처를 1명 이상 추가해 주세요.";
    next.emergencyContacts.forEach((c, idx) => {
      const base = `emergencyContacts.${idx}`;
      if (!trimAll(c.contactName)) e[`${base}.contactName`] = "이름을 입력해 주세요.";
      if (!trimAll(c.contactPhoneNumber))
        e[`${base}.contactPhoneNumber`] = "연락처를 입력해 주세요.";
      else if (!isValidPhone(c.contactPhoneNumber))
        e[`${base}.contactPhoneNumber`] = "번호 형식이 올바르지 않아요.";
      if (!trimAll(c.relationship)) e[`${base}.relationship`] = "관계를 입력해 주세요.";
      if (
        c.contactPhoneNumber.replaceAll("-", "") === next.phoneNumber.replaceAll("-", "")
      )
        e[`${base}.contactPhoneNumber`] = "비상연락처는 본인 번호와 다르게 입력해 주세요.";
    });

    // 3) 선호
    if (!next.petPreference) e["petPreference"] = "희망 유형을 선택해 주세요.";

    // 4) 동거인
    if (!next.cohabitantAgreement) e["cohabitantAgreement"] = "동거인 전원 동의가 필요해요.";
    if (next.hasCohabitant) {
      const a = next.cohabitantComposition.numberOfAdults;
      const c = next.cohabitantComposition.numberOfChildren;

      if (a === "" || a === null)
        e["cohabitantComposition.numberOfAdults"] = "성인 수를 입력해 주세요.";
      else if (!Number.isInteger(Number(a)) || Number(a) < 1)
        e["cohabitantComposition.numberOfAdults"] = "성인 수는 1 이상 정수여야 해요.";

      if (c === "" || c === null)
        e["cohabitantComposition.numberOfChildren"] = "아동 수를 입력해 주세요.";
      else if (!Number.isInteger(Number(c)) || Number(c) < 0)
        e["cohabitantComposition.numberOfChildren"] = "아동 수는 0 이상 정수여야 해요.";

      if (!next.cohabitantDetails?.length)
        e["cohabitantDetails"] = "동거인 정보를 1명 이상 추가해 주세요.";
      next.cohabitantDetails.forEach((d, idx) => {
        const base = `cohabitantDetails.${idx}`;
        if (!trimAll(d.relationship)) e[`${base}.relationship`] = "관계를 입력해 주세요.";
        if (d.age === "" || d.age === null) e[`${base}.age`] = "나이를 입력해 주세요.";
        else if (!Number.isInteger(Number(d.age)) || Number(d.age) < 0 || Number(d.age) > 120)
          e[`${base}.age`] = "나이는 0~120 사이 정수로 입력해 주세요.";
        if (!d.adoptionAgreement) e[`${base}.adoptionAgreement`] = "동의 여부를 체크해 주세요.";
      });
    }

    // 5) 현재 반려동물
    if (next.hasCurrentPets) {
      if (!next.currentPetDetails?.length)
        e["currentPetDetails"] = "현재 반려동물 정보를 1개 이상 추가해 주세요.";
      next.currentPetDetails.forEach((p, idx) => {
        const base = `currentPetDetails.${idx}`;
        if (!trimAll(p.petType)) e[`${base}.petType`] = "종류를 입력해 주세요.";
        if (!trimAll(p.breed)) e[`${base}.breed`] = "품종을 입력해 주세요.";
        if (p.count === "" || p.count === null) e[`${base}.count`] = "마릿수를 입력해 주세요.";
        else if (!Number.isInteger(Number(p.count)) || Number(p.count) < 1)
          e[`${base}.count`] = "마릿수는 1 이상 정수여야 해요.";
        if (p.age === "" || p.age === null) e[`${base}.age`] = "나이를 입력해 주세요.";
        else if (!Number.isInteger(Number(p.age)) || Number(p.age) < 0 || Number(p.age) > 30)
          e[`${base}.age`] = "나이는 0~30 사이 정수로 입력해 주세요.";
        if (!trimAll(p.reasonForAdoptingMore))
          e[`${base}.reasonForAdoptingMore`] = "추가 입양 이유를 입력해 주세요.";
        else if (trimAll(p.reasonForAdoptingMore).length < 10)
          e[`${base}.reasonForAdoptingMore`] = "10자 이상 입력해 주세요.";
      });
    }

    // 6) 과거 경험
    if (next.hasPastPetExperience) {
      if (!next.pastPetExperiences?.length)
        e["pastPetExperiences"] = "과거 양육 경험을 1개 이상 추가해 주세요.";
      next.pastPetExperiences.forEach((p, idx) => {
        const base = `pastPetExperiences.${idx}`;
        if (!trimAll(p.pastPetType)) e[`${base}.pastPetType`] = "종류를 입력해 주세요.";
        if (p.pastPetCount === "" || p.pastPetCount === null)
          e[`${base}.pastPetCount`] = "마릿수를 입력해 주세요.";
        else if (!Number.isInteger(Number(p.pastPetCount)) || Number(p.pastPetCount) < 1)
          e[`${base}.pastPetCount`] = "마릿수는 1 이상 정수여야 해요.";
        if (!trimAll(p.duration)) e[`${base}.duration`] = "기간을 입력해 주세요.";
        if (!trimAll(p.details)) e[`${base}.details`] = "상세 내용을 입력해 주세요.";
        else if (trimAll(p.details).length < 10) e[`${base}.details`] = "10자 이상 입력해 주세요.";
      });
    }

    // 7) 주거/동의
    if (!next.residenceType) e["residenceType"] = "주거 형태를 선택해 주세요.";
    if (!next.agreesToLifetimeCommitment) e["agreesToLifetimeCommitment"] = "평생 책임 동의가 필요해요.";
    if (!next.agreesToFollowUp) e["agreesToFollowUp"] = "사후관리 동의가 필요해요.";

    // 8) 직업/패턴
    if (!trimAll(next.job)) e["job"] = "직업을 입력해 주세요.";
    if (!trimAll(next.workingHours)) e["workingHours"] = "근무시간을 입력해 주세요.";
    if (!trimAll(next.aloneTimeManagement)) e["aloneTimeManagement"] = "혼자 있는 시간 관리 계획을 입력해 주세요.";
    else if (trimAll(next.aloneTimeManagement).length < 20)
      e["aloneTimeManagement"] = "20자 이상 입력해 주세요.";
    if (!next.maritalStatus) e["maritalStatus"] = "혼인 상태를 선택해 주세요.";

    // 9) 공간/사진
    if (!trimAll(next.petLivingSpaceLocation)) e["petLivingSpaceLocation"] = "반려 공간 설명을 입력해 주세요.";
    if (!trimAll(next.petLivingSpacePhotoUrl)) e["petLivingSpacePhotoUrl"] = "반려 공간 사진 URL을 입력해 주세요.";

    // 10) 비용/동기/계획
    if (!next.monthlyExpenseRange) e["monthlyExpenseRange"] = "월 지출 범위를 선택해 주세요.";
    if (!next.agreesToNeutering) e["agreesToNeutering"] = "중성화 동의가 필요해요.";
    if (!trimAll(next.motivationForAdoption)) e["motivationForAdoption"] = "입양 동기를 입력해 주세요.";
    else if (trimAll(next.motivationForAdoption).length < 150)
      e["motivationForAdoption"] = "150자 이상 입력해 주세요.";
    if (!trimAll(next.lifeChangeCopingPlan)) e["lifeChangeCopingPlan"] = "생활 변화 대응 계획을 입력해 주세요.";
    else if (trimAll(next.lifeChangeCopingPlan).length < 20)
      e["lifeChangeCopingPlan"] = "20자 이상 입력해 주세요.";
    if (!trimAll(next.travelCopingPlan)) e["travelCopingPlan"] = "여행/외출 시 계획을 입력해 주세요.";
    else if (trimAll(next.travelCopingPlan).length < 20)
      e["travelCopingPlan"] = "20자 이상 입력해 주세요.";
    if (!next.agreesToRegularUpdates) e["agreesToRegularUpdates"] = "정기 업데이트 동의가 필요해요.";

    // 11) 추가
    if (!trimAll(next.additionalQuestions))
      e["additionalQuestions"] = "추가 질문/전달사항을 입력해 주세요. (없으면 '없음')";

    return e;
  }

  /** ====== 단계별 검증(현재 스텝만) ====== */
  function validateByStep(step: StepId, next: Form): Errors {
    const all = validateAll(next);

    if (step === "BASIC_INFO") {
      return pickErrors(all, [
        "name",
        "dateOfBirth",
        "gender",
        "phoneNumber",
        "email",
        "address",
        "detailAddress",
      ]);
    }

    if (step === "EMERGENCY") {
      return pickErrors(all, ["emergencyContacts"]);
    }

    if (step === "PET_PREF") {
      return pickErrors(all, ["petPreference"]);
    }

    if (step === "COHAB") {
      const base = pickErrors(all, ["cohabitantAgreement"]);
      if (next.hasCohabitant) {
        return {
          ...base,
          ...pickErrors(all, [
            "cohabitantComposition.numberOfAdults",
            "cohabitantComposition.numberOfChildren",
            "cohabitantDetails",
          ]),
        };
      }
      return base;
    }

    if (step === "CURRENT_PETS") {
      if (!next.hasCurrentPets) return {};
      return pickErrors(all, ["currentPetDetails"]);
    }

    if (step === "PAST_PETS") {
      if (!next.hasPastPetExperience) return {};
      return pickErrors(all, ["pastPetExperiences"]);
    }

    if (step === "RESIDENCE") {
      return pickErrors(all, ["residenceType", "maritalStatus"]);
    }

    if (step === "JOB_LIFE") {
      return pickErrors(all, ["job", "workingHours", "aloneTimeManagement"]);
    }

    if (step === "PET_SPACE") {
      return pickErrors(all, ["petLivingSpaceLocation", "petLivingSpacePhotoUrl"]);
    }

    if (step === "REQUIRED_CONSENTS") {
      return pickErrors(all, ["agreesToLifetimeCommitment", "agreesToFollowUp"]);
    }

    if (step === "COST_NEUTERING") {
      return pickErrors(all, ["monthlyExpenseRange", "agreesToNeutering"]);
    }

    if (step === "MOTIVATION_PLAN") {
      return pickErrors(all, [
        "motivationForAdoption",
        "lifeChangeCopingPlan",
        "travelCopingPlan",
        "agreesToRegularUpdates",
      ]);
    }

    if (step === "EXTRA_QUESTIONS") {
      return pickErrors(all, ["additionalQuestions"]);
    }

    return {};
  }

  function sanitize(next: Form): Form {
    return {
      ...next,
      name: trimAll(next.name),
      phoneNumber: trimAll(next.phoneNumber),
      email: trimAll(next.email),
      address: trimAll(next.address),
      detailAddress: trimAll(next.detailAddress),
      job: trimAll(next.job),
      workingHours: trimAll(next.workingHours),
      aloneTimeManagement: trimAll(next.aloneTimeManagement),
      petLivingSpaceLocation: trimAll(next.petLivingSpaceLocation),
      petLivingSpacePhotoUrl: trimAll(next.petLivingSpacePhotoUrl),
      motivationForAdoption: trimAll(next.motivationForAdoption),
      lifeChangeCopingPlan: trimAll(next.lifeChangeCopingPlan),
      travelCopingPlan: trimAll(next.travelCopingPlan),
      additionalQuestions: trimAll(next.additionalQuestions),
      emergencyContacts: next.emergencyContacts.map((c) => ({
        ...c,
        contactName: trimAll(c.contactName),
        contactPhoneNumber: trimAll(c.contactPhoneNumber),
        relationship: trimAll(c.relationship),
      })),
      cohabitantDetails: next.cohabitantDetails.map((d) => ({
        ...d,
        relationship: trimAll(d.relationship),
      })),
      currentPetDetails: next.currentPetDetails.map((p) => ({
        ...p,
        petType: trimAll(p.petType),
        breed: trimAll(p.breed),
        reasonForAdoptingMore: trimAll(p.reasonForAdoptingMore),
      })),
      pastPetExperiences: next.pastPetExperiences.map((p) => ({
        ...p,
        pastPetType: trimAll(p.pastPetType),
        duration: trimAll(p.duration),
        details: trimAll(p.details),
      })),
    };
  }

  function clearStepErrors(step: StepId) {
    const prefixesByStep: Record<StepId, string[]> = {
      BASIC_INFO: [
        "name",
        "dateOfBirth",
        "gender",
        "phoneNumber",
        "email",
        "address",
        "detailAddress",
      ],
      EMERGENCY: ["emergencyContacts"],
      PET_PREF: ["petPreference"],
      COHAB: ["cohabitantAgreement", "cohabitantComposition", "cohabitantDetails"],
      CURRENT_PETS: ["currentPetDetails"],
      PAST_PETS: ["pastPetExperiences"],
      RESIDENCE: ["residenceType", "maritalStatus"],
      JOB_LIFE: ["job", "workingHours", "aloneTimeManagement"],
      PET_SPACE: ["petLivingSpaceLocation", "petLivingSpacePhotoUrl"],
      REQUIRED_CONSENTS: ["agreesToLifetimeCommitment", "agreesToFollowUp"],
      COST_NEUTERING: ["monthlyExpenseRange", "agreesToNeutering"],
      MOTIVATION_PLAN: [
        "motivationForAdoption",
        "lifeChangeCopingPlan",
        "travelCopingPlan",
        "agreesToRegularUpdates",
      ],
      EXTRA_QUESTIONS: ["additionalQuestions"],
    };

    const prefixes = prefixesByStep[step];
    setErrors((prev) => {
      const next: Errors = {};
      for (const [k, v] of Object.entries(prev)) {
        const matched = prefixes.some((p) => k === p || k.startsWith(p + ".") || k.startsWith(p + "["));
        if (!matched) next[k] = v;
      }
      return next;
    });
  }

  function handleNext() {
    const s = sanitize(form);
    const stepErrors = validateByStep(activeStep.id, s);

    clearStepErrors(activeStep.id);
    setErrors((prev) => ({ ...prev, ...stepErrors }));

    if (Object.keys(stepErrors).length > 0) return;

    setForm(s);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function handlePrev() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleFinalSave() {
    if (!isEditable || submitting) return;

    const s = sanitize(form);
    const all = validateAll(s);
    setErrors(all);
    if (Object.keys(all).length > 0) return;

    const payload: AdoptionApplicationRequest = {
      name: s.name,
      dateOfBirth: s.dateOfBirth,
      gender: s.gender as Gender,
      phoneNumber: s.phoneNumber,
      email: s.email,
      address: s.address,
      detailAddress: s.detailAddress,
      emergencyContacts: s.emergencyContacts.map((c) => ({
        contactName: c.contactName,
        contactPhoneNumber: c.contactPhoneNumber,
        relationship: c.relationship,
      })),
      petPreference: s.petPreference as PetPreference,
      cohabitantAgreement: s.cohabitantAgreement,
      hasCohabitant: s.hasCohabitant,
      cohabitantComposition: s.hasCohabitant
        ? {
            numberOfAdults: Number(s.cohabitantComposition.numberOfAdults),
            numberOfChildren: Number(s.cohabitantComposition.numberOfChildren ?? 0),
          }
        : null,
      cohabitantDetails: s.hasCohabitant
        ? s.cohabitantDetails.map((d) => ({
            relationship: d.relationship,
            age: Number(d.age),
            hasAllergy: d.hasAllergy,
            adoptionAgreement: d.adoptionAgreement,
          }))
        : [],
      hasCurrentPets: s.hasCurrentPets,
      currentPetDetails: s.hasCurrentPets
        ? s.currentPetDetails.map((p) => ({
            petType: p.petType,
            breed: p.breed,
            count: Number(p.count),
            age: p.age === "" ? null : Number(p.age),
            neutered: p.neutered,
            reasonForAdoptingMore: p.reasonForAdoptingMore,
          }))
        : [],
      hasPastPetExperience: s.hasPastPetExperience,
      pastPetExperiences: s.hasPastPetExperience
        ? s.pastPetExperiences.map((p) => ({
            pastPetType: p.pastPetType,
            pastPetCount: Number(p.pastPetCount),
            duration: p.duration,
            isCurrentlyWithYou: p.isCurrentlyWithYou,
            details: p.details,
          }))
        : [],
      residenceType: s.residenceType as ResidenceType,
      isOwner: s.isOwner,
      completedOwnerEducation: s.completedOwnerEducation,
      agreesToLifetimeCommitment: s.agreesToLifetimeCommitment,
      agreesToFollowUp: s.agreesToFollowUp,
      job: s.job,
      workingHours: s.workingHours,
      aloneTimeManagement: s.aloneTimeManagement,
      maritalStatus: s.maritalStatus as MaritalStatus,
      petLivingSpaceLocation: s.petLivingSpaceLocation,
      petLivingSpacePhotoUrl: s.petLivingSpacePhotoUrl,
      monthlyExpenseRange: s.monthlyExpenseRange as MonthlyExpenseRange,
      agreesToNeutering: s.agreesToNeutering,
      motivationForAdoption: s.motivationForAdoption,
      lifeChangeCopingPlan: s.lifeChangeCopingPlan,
      travelCopingPlan: s.travelCopingPlan,
      agreesToRegularUpdates: s.agreesToRegularUpdates,
      additionalQuestions: s.additionalQuestions,
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { applicationId } = await submitAdoptionApplication(payload);
      localStorage.setItem(APPLICATION_ID_KEY, String(applicationId));

      setForm(s);
      setOpen(false);
      setStepIndex(0);
      onSubmitSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "제출 중 오류가 발생했습니다.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const summary = useMemo(() => {
    return {
      name: form.name ? form.name : "미작성",
      phone: form.phoneNumber ? form.phoneNumber : "미작성",
      address: form.address ? form.address : "미작성",
      cohabitant: form.hasCohabitant ? "있음" : "없음",
    };
  }, [form]);

  /** ====== 스텝 UI 렌더 ====== */
  function renderStepHeader() {
    const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">입양 신청서 작성</p>
            <p className="mt-1 text-sm text-gray-500">{activeStep.desc}</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">
              {stepIndex + 1} / {STEPS.length}
            </p>
            <p className="text-sm font-semibold text-gray-900">{activeStep.title}</p>
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-[#5f7cf7]" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex flex-wrap gap-2">
          {STEPS.map((s, idx) => {
            const isActive = idx === stepIndex;
            const isDone = idx < stepIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStepIndex(idx)}
                className={[
                  "rounded-full border px-3 py-1 text-xs font-semibold transition",
                  isActive
                    ? "border-[#5f7cf7] bg-blue-50 text-blue-700"
                    : isDone
                    ? "border-gray-200 bg-gray-50 text-gray-700"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                ].join(" ")}
              >
                {idx + 1}. {s.title}
              </button>
            );
          })}
        </div>
      </div>
    );
  }


  function renderStepBody() {
    switch (activeStep.id) {
      case "BASIC_INFO":
        return (
          <div className="space-y-8">
            {/* 기본 정보 */}
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 기본 정보</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="이름" error={errors["name"]}>
                  <TextInput value={form.name} onChange={(v) => setField("name", v)} />
                </Field>

                <Field label="생년월일" error={errors["dateOfBirth"]}>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setField("dateOfBirth", e.target.value)}
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
                  />
                </Field>

                <Field label="성별" error={errors["gender"]}>
                  <Select
                    value={form.gender}
                    onChange={(v) => setField("gender", v as Gender)}
                    options={[
                      { value: "MALE", label: "남성" },
                      { value: "FEMALE", label: "여성" },
                      { value: "OTHER", label: "기타" },
                    ]}
                  />
                </Field>

                <Field label="연락처" error={errors["phoneNumber"]}>
                  <TextInput
                    value={form.phoneNumber}
                    onChange={(v) => setField("phoneNumber", v)}
                    placeholder="000-0000-0000"
                  />
                </Field>

                <Field label="이메일" error={errors["email"]}>
                  <TextInput
                    value={form.email}
                    onChange={(v) => setField("email", v)}
                    placeholder="name@example.com"
                  />
                </Field>

                <Field label="주소" error={errors["address"]}>
                  <TextInput
                    value={form.address}
                    onChange={(v) => setField("address", v)}
                    placeholder="예) 광주광역시 ..."
                  />
                </Field>

                <div className="col-span-2">
                  <Field label="상세주소" error={errors["detailAddress"]}>
                    <TextInput
                      value={form.detailAddress}
                      onChange={(v) => setField("detailAddress", v)}
                      placeholder="예) 101동 1004호"
                    />
                  </Field>
                </div>
              </div>
            </section>
          </div>
        );

      case "EMERGENCY":
        return (
          <div className="space-y-8">
            {/* 비상연락망 */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">✅ 비상연락망</p>
                <Button
                  variant="outline"
                  className="rounded-lg"
                  onClick={() =>
                    setField("emergencyContacts", [
                      ...form.emergencyContacts,
                      { contactName: "", contactPhoneNumber: "", relationship: "" },
                    ])
                  }
                >
                  + 추가
                </Button>
              </div>

              {errors["emergencyContacts"] ? (
                <p className="text-xs text-red-600">{errors["emergencyContacts"]}</p>
              ) : null}

              <div className="space-y-4">
                {form.emergencyContacts.map((c, idx) => (
                  <div key={idx} className="rounded-2xl border border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">비상연락처 {idx + 1}</p>
                      <Button
                        variant="outline"
                        className="rounded-lg"
                        onClick={() =>
                          setField(
                            "emergencyContacts",
                            form.emergencyContacts.filter((_, i) => i !== idx)
                          )
                        }
                        disabled={form.emergencyContacts.length === 1}
                      >
                        삭제
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Field label="이름" error={errors[`emergencyContacts.${idx}.contactName`]}>
                        <TextInput
                          value={c.contactName}
                          onChange={(v) =>
                            setField(
                              "emergencyContacts",
                              form.emergencyContacts.map((x, i) =>
                                i === idx ? { ...x, contactName: v } : x
                              )
                            )
                          }
                        />
                      </Field>

                      <Field label="연락처" error={errors[`emergencyContacts.${idx}.contactPhoneNumber`]}>
                        <TextInput
                          value={c.contactPhoneNumber}
                          onChange={(v) =>
                            setField(
                              "emergencyContacts",
                              form.emergencyContacts.map((x, i) =>
                                i === idx ? { ...x, contactPhoneNumber: v } : x
                              )
                            )
                          }
                        />
                      </Field>

                      <Field label="관계" error={errors[`emergencyContacts.${idx}.relationship`]}>
                        <TextInput
                          value={c.relationship}
                          onChange={(v) =>
                            setField(
                              "emergencyContacts",
                              form.emergencyContacts.map((x, i) =>
                                i === idx ? { ...x, relationship: v } : x
                              )
                            )
                          }
                          placeholder="예) 부모/친구"
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case "PET_PREF":
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 입양 희망</p>
              <Field label="희망 유형" error={errors["petPreference"]}>
                <Select
                  value={form.petPreference}
                  onChange={(v) => setField("petPreference", v as PetPreference)}
                  options={[
                    { value: "ADULT_DOG", label: "성견" },
                    { value: "PUPPY", label: "자견" },
                    { value: "ANY", label: "상관없음" },
                  ]}
                />
              </Field>
            </section>
          </div>
        );

      case "COHAB":
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 동거인</p>

              <div className="flex flex-wrap items-center gap-6">
                <Field label="동거인 여부" required>
                  <Toggle
                    value={form.hasCohabitant}
                    onChange={(v) => setField("hasCohabitant", v)}
                    labels={["없음", "있음"]}
                  />
                </Field>

                <div className="flex-1">
                  <Field label="동거인 전원 동의" error={errors["cohabitantAgreement"]}>
                    <Checkbox
                      checked={form.cohabitantAgreement}
                      onChange={(v) => setField("cohabitantAgreement", v)}
                      label="동거인 전원이 입양에 동의합니다."
                    />
                  </Field>
                </div>
              </div>

              {form.hasCohabitant ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="성인 수" error={errors["cohabitantComposition.numberOfAdults"]}>
                      <TextInput
                        value={String(form.cohabitantComposition.numberOfAdults)}
                        onChange={(v) =>
                          setField("cohabitantComposition", {
                            ...form.cohabitantComposition,
                            numberOfAdults: v === "" ? "" : Number(v),
                          })
                        }
                        placeholder="예) 2"
                      />
                    </Field>

                    <Field label="아동 수" error={errors["cohabitantComposition.numberOfChildren"]}>
                      <TextInput
                        value={String(form.cohabitantComposition.numberOfChildren)}
                        onChange={(v) =>
                          setField("cohabitantComposition", {
                            ...form.cohabitantComposition,
                            numberOfChildren: v === "" ? "" : Number(v),
                          })
                        }
                        placeholder="예) 0"
                      />
                    </Field>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">동거인 상세</p>
                    <Button
                      variant="outline"
                      className="rounded-lg"
                      onClick={() =>
                        setField("cohabitantDetails", [
                          ...form.cohabitantDetails,
                          { relationship: "", age: "", hasAllergy: false, adoptionAgreement: false },
                        ])
                      }
                    >
                      + 추가
                    </Button>
                  </div>

                  {form.cohabitantDetails.map((d, idx) => (
                    <div key={idx} className="rounded-2xl border border-gray-200 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">동거인 {idx + 1}</p>
                        <Button
                          variant="outline"
                          className="rounded-lg"
                          onClick={() =>
                            setField(
                              "cohabitantDetails",
                              form.cohabitantDetails.filter((_, i) => i !== idx)
                            )
                          }
                          disabled={form.cohabitantDetails.length === 1}
                        >
                          삭제
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <Field label="관계" error={errors[`cohabitantDetails.${idx}.relationship`]}>
                          <TextInput
                            value={d.relationship}
                            onChange={(v) =>
                              setField(
                                "cohabitantDetails",
                                form.cohabitantDetails.map((x, i) =>
                                  i === idx ? { ...x, relationship: v } : x
                                )
                              )
                            }
                            placeholder="예) 배우자/부모"
                          />
                        </Field>

                        <Field label="나이" error={errors[`cohabitantDetails.${idx}.age`]}>
                          <TextInput
                            value={String(d.age)}
                            onChange={(v) =>
                              setField(
                                "cohabitantDetails",
                                form.cohabitantDetails.map((x, i) =>
                                  i === idx ? { ...x, age: v === "" ? "" : Number(v) } : x
                                )
                              )
                            }
                            placeholder="예) 29"
                          />
                        </Field>

                        <div className="space-y-2">
                          <Field label="알레르기 여부" required>
                            <Toggle
                              value={d.hasAllergy}
                              onChange={(v) =>
                                setField(
                                  "cohabitantDetails",
                                  form.cohabitantDetails.map((x, i) =>
                                    i === idx ? { ...x, hasAllergy: v } : x
                                  )
                                )
                              }
                              labels={["없음", "있음"]}
                            />
                          </Field>

                          <Field label="입양 동의" error={errors[`cohabitantDetails.${idx}.adoptionAgreement`]}>
                            <Checkbox
                              checked={d.adoptionAgreement}
                              onChange={(v) =>
                                setField(
                                  "cohabitantDetails",
                                  form.cohabitantDetails.map((x, i) =>
                                    i === idx ? { ...x, adoptionAgreement: v } : x
                                  )
                                )
                              }
                              label="동의합니다."
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  동거인이 없다면, 다음 단계로 이동해도 됩니다.
                </div>
              )}
            </section>
          </div>
        );

      case "CURRENT_PETS":
        return (
          <div className="space-y-6">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 현재 반려동물</p>
              <Field label="현재 반려동물 여부" required>
                <Toggle
                  value={form.hasCurrentPets}
                  onChange={(v) => setField("hasCurrentPets", v)}
                  labels={["없음", "있음"]}
                />
              </Field>

              {!form.hasCurrentPets ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  현재 반려동물이 없다면, 다음으로 이동해도 됩니다.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">현재 반려동물 상세</p>
                    <Button
                      variant="outline"
                      className="rounded-lg"
                      onClick={() =>
                        setField("currentPetDetails", [
                          ...form.currentPetDetails,
                          {
                            petType: "",
                            breed: "",
                            count: "",
                            age: "",
                            neutered: false,
                            reasonForAdoptingMore: "",
                          },
                        ])
                      }
                    >
                      + 추가
                    </Button>
                  </div>

                  {errors["currentPetDetails"] ? (
                    <p className="text-xs text-red-600">{errors["currentPetDetails"]}</p>
                  ) : null}

                  {form.currentPetDetails.map((p, idx) => (
                    <div key={idx} className="rounded-2xl border border-gray-200 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">반려동물 {idx + 1}</p>
                        <Button
                          variant="outline"
                          className="rounded-lg"
                          onClick={() =>
                            setField("currentPetDetails", form.currentPetDetails.filter((_, i) => i !== idx))
                          }
                          disabled={form.currentPetDetails.length === 1}
                        >
                          삭제
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="종류" error={errors[`currentPetDetails.${idx}.petType`]}>
                          <TextInput
                            value={p.petType}
                            onChange={(v) =>
                              setField(
                                "currentPetDetails",
                                form.currentPetDetails.map((x, i) => (i === idx ? { ...x, petType: v } : x))
                              )
                            }
                            placeholder="예) 강아지/고양이"
                          />
                        </Field>

                        <Field label="품종" error={errors[`currentPetDetails.${idx}.breed`]}>
                          <TextInput
                            value={p.breed}
                            onChange={(v) =>
                              setField(
                                "currentPetDetails",
                                form.currentPetDetails.map((x, i) => (i === idx ? { ...x, breed: v } : x))
                              )
                            }
                            placeholder="예) 믹스"
                          />
                        </Field>

                        <Field label="마릿수" error={errors[`currentPetDetails.${idx}.count`]}>
                          <TextInput
                            value={String(p.count)}
                            onChange={(v) =>
                              setField(
                                "currentPetDetails",
                                form.currentPetDetails.map((x, i) =>
                                  i === idx ? { ...x, count: v === "" ? "" : Number(v) } : x
                                )
                              )
                            }
                          />
                        </Field>

                        <Field label="나이" error={errors[`currentPetDetails.${idx}.age`]}>
                          <TextInput
                            value={String(p.age)}
                            onChange={(v) =>
                              setField(
                                "currentPetDetails",
                                form.currentPetDetails.map((x, i) =>
                                  i === idx ? { ...x, age: v === "" ? "" : Number(v) } : x
                                )
                              )
                            }
                          />
                        </Field>

                        <div className="col-span-2">
                          <Field label="추가 입양 이유" error={errors[`currentPetDetails.${idx}.reasonForAdoptingMore`]}>
                            <TextArea
                              value={p.reasonForAdoptingMore}
                              onChange={(v) =>
                                setField(
                                  "currentPetDetails",
                                  form.currentPetDetails.map((x, i) =>
                                    i === idx ? { ...x, reasonForAdoptingMore: v } : x
                                  )
                                )
                              }
                              rows={3}
                              placeholder="10자 이상"
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        );



      case "PAST_PETS":
        return (
          <div className="space-y-6">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 과거 양육 경험</p>
              <Field label="과거 양육 경험 여부" required>
                <Toggle
                  value={form.hasPastPetExperience}
                  onChange={(v) => setField("hasPastPetExperience", v)}
                  labels={["없음", "있음"]}
                />
              </Field>

              {!form.hasPastPetExperience ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  과거 양육 경험이 없다면, 다음으로 이동해도 됩니다.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">과거 경험 상세</p>
                    <Button
                      variant="outline"
                      className="rounded-lg"
                      onClick={() =>
                        setField("pastPetExperiences", [
                          ...form.pastPetExperiences,
                          {
                            pastPetType: "",
                            pastPetCount: "",
                            duration: "",
                            isCurrentlyWithYou: false,
                            details: "",
                          },
                        ])
                      }
                    >
                      + 추가
                    </Button>
                  </div>

                  {errors["pastPetExperiences"] ? (
                    <p className="text-xs text-red-600">{errors["pastPetExperiences"]}</p>
                  ) : null}

                  {form.pastPetExperiences.map((p, idx) => (
                    <div key={idx} className="rounded-2xl border border-gray-200 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">경험 {idx + 1}</p>
                        <Button
                          variant="outline"
                          className="rounded-lg"
                          onClick={() =>
                            setField(
                              "pastPetExperiences",
                              form.pastPetExperiences.filter((_, i) => i !== idx)
                            )
                          }
                          disabled={form.pastPetExperiences.length === 1}
                        >
                          삭제
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="종류" error={errors[`pastPetExperiences.${idx}.pastPetType`]}>
                          <TextInput
                            value={p.pastPetType}
                            onChange={(v) =>
                              setField(
                                "pastPetExperiences",
                                form.pastPetExperiences.map((x, i) =>
                                  i === idx ? { ...x, pastPetType: v } : x
                                )
                              )
                            }
                          />
                        </Field>

                        <Field label="마릿수" error={errors[`pastPetExperiences.${idx}.pastPetCount`]}>
                          <TextInput
                            value={String(p.pastPetCount)}
                            onChange={(v) =>
                              setField(
                                "pastPetExperiences",
                                form.pastPetExperiences.map((x, i) =>
                                  i === idx ? { ...x, pastPetCount: v === "" ? "" : Number(v) } : x
                                )
                              )
                            }
                          />
                        </Field>

                        <Field label="기간" error={errors[`pastPetExperiences.${idx}.duration`]}>
                          <TextInput
                            value={p.duration}
                            onChange={(v) =>
                              setField(
                                "pastPetExperiences",
                                form.pastPetExperiences.map((x, i) =>
                                  i === idx ? { ...x, duration: v } : x
                                )
                              )
                            }
                            placeholder="예) 2년 / 6개월"
                          />
                        </Field>

                        <Field label="현재도 함께 지냄" required>
                          <Toggle
                            value={p.isCurrentlyWithYou}
                            onChange={(v) =>
                              setField(
                                "pastPetExperiences",
                                form.pastPetExperiences.map((x, i) =>
                                  i === idx ? { ...x, isCurrentlyWithYou: v } : x
                                )
                              )
                            }
                            labels={["아니오", "예"]}
                          />
                        </Field>

                        <div className="col-span-2">
                          <Field label="상세" error={errors[`pastPetExperiences.${idx}.details`]}>
                            <TextArea
                              value={p.details}
                              onChange={(v) =>
                                setField(
                                  "pastPetExperiences",
                                  form.pastPetExperiences.map((x, i) =>
                                    i === idx ? { ...x, details: v } : x
                                  )
                                )
                              }
                              rows={4}
                              placeholder="10자 이상"
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        );

      case "RESIDENCE":
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 주거 형태</p>

              <div className="grid grid-cols-2 gap-4">
                <Field label="주거 형태" error={errors["residenceType"]}>
                  <Select
                    value={form.residenceType}
                    onChange={(v) => setField("residenceType", v as ResidenceType)}
                    options={[
                      { value: "APARTMENT", label: "아파트" },
                      { value: "STUDIO_APARTMENT", label: "원룸/오피스텔" },
                      { value: "SINGLE_FAMILY_HOUSE", label: "단독주택" },
                      { value: "MULTI_FAMILY_HOUSE", label: "다가구/빌라" },
                      { value: "OTHER", label: "기타" },
                    ]}
                  />
                </Field>

                <Field label="혼인 상태" error={errors["maritalStatus"]}>
                  <Select
                    value={form.maritalStatus}
                    onChange={(v) => setField("maritalStatus", v as MaritalStatus)}
                    options={[
                      { value: "SINGLE", label: "미혼" },
                      { value: "MARRIED", label: "기혼" },
                      { value: "DIVORCED", label: "이혼" },
                      { value: "OTHER", label: "기타" },
                    ]}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="주거 소유 여부" required>
                  <Toggle value={form.isOwner} onChange={(v) => setField("isOwner", v)} labels={["임차", "자가"]} />
                </Field>

                <Field label="보호자 교육 이수" required>
                  <Toggle
                    value={form.completedOwnerEducation}
                    onChange={(v) => setField("completedOwnerEducation", v)}
                    labels={["미이수", "이수"]}
                  />
                </Field>
              </div>
            </section>
          </div>
        );

      case "JOB_LIFE":
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 직업/생활 패턴</p>

              <div className="grid grid-cols-2 gap-4">
                <Field label="직업" error={errors["job"]}>
                  <TextInput value={form.job} onChange={(v) => setField("job", v)} placeholder="예) 회사원" />
                </Field>

                <Field label="근무시간" error={errors["workingHours"]} hint="예) 09:00~18:00">
                  <TextInput
                    value={form.workingHours}
                    onChange={(v) => setField("workingHours", v)}
                    placeholder="예) 09:00~18:00"
                  />
                </Field>
              </div>

              <Field label="혼자 있는 시간 관리 계획" error={errors["aloneTimeManagement"]} hint="20자 이상">
                <TextArea
                  value={form.aloneTimeManagement}
                  onChange={(v) => setField("aloneTimeManagement", v)}
                  rows={4}
                  placeholder="예) 아침 산책 30분, 점심엔 가족이 돌봄, 저녁엔 산책/놀이..."
                />
              </Field>
            </section>
          </div>
        );

      case "PET_SPACE":
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 반려 공간</p>

              <Field label="반려 공간 위치/설명" error={errors["petLivingSpaceLocation"]}>
                <TextArea
                  value={form.petLivingSpaceLocation}
                  onChange={(v) => setField("petLivingSpaceLocation", v)}
                  rows={3}
                  placeholder="예) 거실에서 생활, 잠은 방 안 켄넬, 베란다 출입 가능..."
                />
              </Field>

              <Field label="반려 공간 사진 URL" error={errors["petLivingSpacePhotoUrl"]} hint="https://...">
                <TextInput
                  value={form.petLivingSpacePhotoUrl}
                  onChange={(v) => setField("petLivingSpacePhotoUrl", v)}
                  placeholder="예) https://image-host.com/photo.jpg"
                />
              </Field>
            </section>
          </div>
        );

      case "REQUIRED_CONSENTS":
        return (
          <div className="space-y-8">
            <section className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">✅ 필수 동의</p>

              <Field label="평생 책임 동의" error={errors["agreesToLifetimeCommitment"]}>
                <Checkbox
                  checked={form.agreesToLifetimeCommitment}
                  onChange={(v) => setField("agreesToLifetimeCommitment", v)}
                  label="입양 후 평생 책임지겠습니다."
                />
              </Field>

              <Field label="사후관리(추적) 동의" error={errors["agreesToFollowUp"]}>
                <Checkbox
                  checked={form.agreesToFollowUp}
                  onChange={(v) => setField("agreesToFollowUp", v)}
                  label="입양 후 사후관리(연락/방문)에 협조하겠습니다."
                />
              </Field>
            </section>
          </div>
        );

      case "COST_NEUTERING":
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 비용/중성화</p>

              <div className="grid grid-cols-2 gap-4">
                <Field label="월 예상 지출" error={errors["monthlyExpenseRange"]}>
                  <Select
                    value={form.monthlyExpenseRange}
                    onChange={(v) => setField("monthlyExpenseRange", v as MonthlyExpenseRange)}
                    options={[
                      { value: "RANGE_0_5", label: "0~5만원" },
                      { value: "RANGE_5_10", label: "5~10만원" },
                      { value: "RANGE_10_20", label: "10~20만원" },
                      { value: "RANGE_20_UP", label: "20만원 이상" },
                      { value: "NOT_SURE", label: "잘 모르겠음" },
                    ]}
                  />
                </Field>

                <Field label="중성화 동의" error={errors["agreesToNeutering"]}>
                  <Checkbox
                    checked={form.agreesToNeutering}
                    onChange={(v) => setField("agreesToNeutering", v)}
                    label="중성화에 동의합니다."
                  />
                </Field>
              </div>
            </section>
          </div>
        );

      case "MOTIVATION_PLAN":
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 동기/계획</p>

              <Field label="입양 동기" error={errors["motivationForAdoption"]} hint="150자 이상">
                <TextArea
                  value={form.motivationForAdoption}
                  onChange={(v) => setField("motivationForAdoption", v)}
                  rows={6}
                  placeholder="왜 입양을 결심했는지, 어떤 책임을 어떻게 이행할지 구체적으로 작성해 주세요."
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="생활 변화 대응" error={errors["lifeChangeCopingPlan"]} hint="20자 이상">
                  <TextArea
                    value={form.lifeChangeCopingPlan}
                    onChange={(v) => setField("lifeChangeCopingPlan", v)}
                    rows={4}
                    placeholder="예) 이사/출산/직장변동 시 돌봄 계획..."
                  />
                </Field>

                <Field label="여행/외출 시 계획" error={errors["travelCopingPlan"]} hint="20자 이상">
                  <TextArea
                    value={form.travelCopingPlan}
                    onChange={(v) => setField("travelCopingPlan", v)}
                    rows={4}
                    placeholder="예) 펫시터/가족 돌봄, 호텔/병원 대비..."
                  />
                </Field>
              </div>

              <Field label="정기 업데이트 동의" error={errors["agreesToRegularUpdates"]}>
                <Checkbox
                  checked={form.agreesToRegularUpdates}
                  onChange={(v) => setField("agreesToRegularUpdates", v)}
                  label="입양 후 정기 업데이트(사진/근황 공유)에 동의합니다."
                />
              </Field>
            </section>
          </div>
        );

      case "EXTRA_QUESTIONS":
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">✅ 추가 질문/전달사항</p>
              <Field label="추가 질문/전달사항" error={errors["additionalQuestions"]} hint="없으면 '없음'">
                <TextArea
                  value={form.additionalQuestions}
                  onChange={(v) => setField("additionalQuestions", v)}
                  rows={4}
                  placeholder="없으면 '없음'이라고 적어 주세요."
                />
              </Field>
            </section>
          </div>
        );

      default:
        return null;
    }
  }
  /** ====== 간단 모달 래퍼 ====== */
  return (
    <div className="space-y-3">
      {/* 요약 카드 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">입양 신청서</p>
          </div>

          <div className="flex items-center gap-2">
            {errorCount > 0 ? (
              <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                미작성 {errorCount}건
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                누락 없음
              </span>
            )}

            {/* ✅ 작성하기: 흰색 버튼 */}
            <Button
              onClick={() => setOpen(true)}
              disabled={!isEditable}
              className="
                rounded-md
                border border-gray-300
                bg-white text-gray-700
                hover:bg-gray-50
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              작성하기
            </Button>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <p className="text-base font-semibold text-gray-900">입양 신청서</p>
                <p className="text-xs text-gray-500">필수 항목을 모두 작성하면 저장할 수 있어요.</p>
              </div>
              <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
              {renderStepHeader()}

              <div className="mt-6">
                <fieldset disabled={!isEditable} className="disabled:opacity-70">
                  {renderStepBody()}
                </fieldset>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <div className="text-xs text-gray-500">
                {errorCount > 0 ? `현재 전체 에러: ${errorCount}개` : "작성 완료 상태입니다."}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-md"
                  onClick={handlePrev}
                  disabled={stepIndex === 0}
                >
                  이전
                </Button>

                {!isLastStep ? (
                  // ✅ 다음: 흰색(보조)로 유지
                  <Button
                    variant="outline"
                    className="rounded-md"
                    onClick={handleNext}
                  >
                    다음
                  </Button>
                ) : (
                  // ✅ 최종 저장(제출): 파란색 고정
                  <Button
                    className="rounded-md bg-[#0064FF] hover:bg-[#0056E6] disabled:opacity-50"
                    onClick={handleFinalSave}
                    disabled={submitting}
                  >
                    {submitting ? "저장 중..." : "최종 저장"}
                  </Button>
                )}
              </div>
            </div>

            {submitError ? (
              <div className="px-6 pb-4 text-xs text-red-600">{submitError}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}