import "@/shared/styles/uiverse/RadioTabs.css";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
};

export function RadioTabs({
  options,
  value,
  onChange,
  name = "radio-tabs",
}: Props) {
  return (
    <div className="radio-inputs">
      {options.map((opt) => (
        <label key={opt.value} className="radio">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          <span className="name">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
