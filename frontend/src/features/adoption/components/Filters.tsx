import React, { useEffect, useId, useMemo, useRef, useState } from "react";

type DropdownKey = "breed" | "province" | "city" | null;

export const DEFAULT_BREED = "모든 품종";
export const DEFAULT_PROVINCE = "전체지역";
export const DEFAULT_CITY = "전체도시";

function Chevron({ direction = "down" }: { direction?: "down" | "up" }) {
  const rotateClass = direction === "up" ? "rotate-180" : "";
  return (
    <svg className={`size-5 ${rotateClass}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type SelectOption = { label: string; value: string };

function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [ref, handler]);
}

function AccessibleSelect({
  label,
  value,
  displayValue,
  options,
  isOpen,
  disabled,
  onToggle,
  onSelect,
  onClose,
  widthClass = "w-[140px]",
}: {
  label: string;
  value: string;
  displayValue?: string;
  options: SelectOption[];
  isOpen: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onClose: () => void;
  widthClass?: string;
}) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  // 키보드 포커스/하이라이트 인덱스
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  const [activeIndex, setActiveIndex] = useState<number>(selectedIndex);

  // 열릴 때 현재 선택값으로 activeIndex 맞추기
  useEffect(() => {
    if (isOpen) setActiveIndex(selectedIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, value]);

  useOnClickOutside(rootRef, () => {
    if (isOpen) onClose();
  });

  const selectAt = (idx: number) => {
    const opt = options[idx];
    if (!opt) return;
    onSelect(opt.value);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!isOpen) {
      // 닫힌 상태에서 열기
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        onToggle();
      }
      return;
    }

    // 열린 상태
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, options.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectAt(activeIndex);
    }
  };

  return (
    <div ref={rootRef} className={`${widthClass} relative`}>
      <div className="text-[10px] font-semibold text-[#333]">{label}</div>

      <button
        type="button"
        className={[
          "mt-1 w-full flex items-center justify-between rounded-lg bg-white px-2 py-1.5 text-[10px] font-medium shadow-[0_3px_9px_rgba(0,0,0,0.08)]",
          disabled ? "text-[#999] cursor-not-allowed opacity-70" : "text-[#333] cursor-pointer",
        ].join(" ")}
        onClick={() => {
          if (disabled) return;
          onToggle();
        }}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        disabled={disabled}
      >
        <span className="truncate">{displayValue ?? value}</span>
        <Chevron direction={isOpen ? "up" : "down"} />
      </button>

      {isOpen && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute z-50 mt-1 w-full rounded-lg bg-white px-2 py-2 text-[10px] font-medium text-[#333] shadow-[0_3px_9px_rgba(0,0,0,0.08)]"
        >
          <ul className="max-h-[160px] overflow-auto space-y-1">
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isActive = idx === activeIndex;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={[
                      "w-full text-left rounded-md px-2 py-1 flex items-center justify-between",
                      isActive ? "bg-black/5" : "",
                      isSelected ? "font-semibold" : "",
                    ].join(" ")}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => selectAt(idx)}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <span aria-hidden="true">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {disabled && (
        <div className="mt-1 text-[9px] text-[#999]">도를 먼저 선택하세요</div>
      )}
    </div>
  );
}

type FiltersProps = {
  breeds: string[];
  provinces: SelectOption[];
  cities: SelectOption[];
  onChange?: (value: {
    breed: string;
    province: string;
    city: string;
    provinceLabel: string;
    cityLabel: string;
  }) => void;
};

export default function Filters({ breeds, provinces, cities, onChange }: FiltersProps) {
  const [open, setOpen] = useState<DropdownKey>(null);

  const [breed, setBreed] = useState<string>(DEFAULT_BREED);
  const [province, setProvince] = useState<string>(DEFAULT_PROVINCE);
  const [city, setCity] = useState<string>(DEFAULT_CITY);

  const normalizedBreeds = useMemo(
    () =>
      Array.from(
        new Set(
          breeds
            .map((value) => value.trim())
            .filter((value) => value.length > 0)
        )
      ).sort((a, b) => a.localeCompare(b, "ko")),
    [breeds]
  );

  const breedOptions: SelectOption[] = useMemo(
    () => [{ label: DEFAULT_BREED, value: DEFAULT_BREED }, ...normalizedBreeds.map((b) => ({ label: b, value: b }))],
    [normalizedBreeds]
  );

  const provinceOptions: SelectOption[] = useMemo(
    () => [{ label: DEFAULT_PROVINCE, value: DEFAULT_PROVINCE }, ...provinces],
    [provinces]
  );

  const isCityDisabled = province === DEFAULT_PROVINCE;

  const cityOptions: SelectOption[] = useMemo(
    () =>
      isCityDisabled
        ? [{ label: DEFAULT_CITY, value: DEFAULT_CITY }]
        : [{ label: DEFAULT_CITY, value: DEFAULT_CITY }, ...cities],
    [cities, isCityDisabled]
  );

  const selectedProvinceLabel = useMemo(() => {
    const found = provinceOptions.find((option) => option.value === province);
    return found?.label ?? province;
  }, [provinceOptions, province]);

  const selectedCityLabel = useMemo(() => {
    const found = cityOptions.find((option) => option.value === city);
    return found?.label ?? city;
  }, [cityOptions, city]);

  // ✅ 도 변경 시 시 초기화(종속 필터)
  useEffect(() => {
    if (province === DEFAULT_PROVINCE) {
      setCity(DEFAULT_CITY);
      if (open === "city") setOpen(null);
      return;
    }
    const validCities = new Set(cityOptions.map((o) => o.value));
    if (!validCities.has(city)) setCity(DEFAULT_CITY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province]);

  useEffect(() => {
    const validBreeds = new Set(breedOptions.map((option) => option.value));
    if (!validBreeds.has(breed)) {
      setBreed(DEFAULT_BREED);
      if (open === "breed") setOpen(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breedOptions]);

  useEffect(() => {
    const validProvinces = new Set(provinceOptions.map((option) => option.value));
    if (!validProvinces.has(province)) {
      setProvince(DEFAULT_PROVINCE);
      setCity(DEFAULT_CITY);
      if (open === "province") setOpen(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceOptions]);

  useEffect(() => {
    const validCities = new Set(cityOptions.map((option) => option.value));
    if (!validCities.has(city)) {
      setCity(DEFAULT_CITY);
      if (open === "city") setOpen(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityOptions]);

  const close = () => setOpen(null);

  useEffect(() => {
    const currentProvinceLabel =
      province === DEFAULT_PROVINCE
        ? DEFAULT_PROVINCE
        : provinceOptions.find((option) => option.value === province)?.label ?? province;
    const currentCityLabel =
      city === DEFAULT_CITY
        ? DEFAULT_CITY
        : cityOptions.find((option) => option.value === city)?.label ?? city;

    onChange?.({
      breed,
      province,
      city,
      provinceLabel: currentProvinceLabel,
      cityLabel: currentCityLabel,
    });
  }, [breed, province, city, onChange, provinceOptions, cityOptions]);

  return (
    <div className="mt-2 flex items-start gap-2">
      <AccessibleSelect
        label="품종"
        value={breed}
        options={breedOptions}
        isOpen={open === "breed"}
        onToggle={() => setOpen((prev) => (prev === "breed" ? null : "breed"))}
        onSelect={(v) => setBreed(v)}
        onClose={close}
      />

      <AccessibleSelect
        label="도"
        value={province}
        displayValue={selectedProvinceLabel}
        options={provinceOptions}
        isOpen={open === "province"}
        onToggle={() => setOpen((prev) => (prev === "province" ? null : "province"))}
        onSelect={(v) => {
          setProvince(v);
          setCity(DEFAULT_CITY);
        }}
        onClose={close}
      />

      <AccessibleSelect
        label="시"
        value={city}
        displayValue={selectedCityLabel}
        options={cityOptions}
        isOpen={open === "city"}
        disabled={isCityDisabled}
        onToggle={() => setOpen((prev) => (prev === "city" ? null : "city"))}
        onSelect={(v) => setCity(v)}
        onClose={close}
      />
    </div>
  );
}
