import "@/shared/styles/uiverse/FloatingInput.css";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  name?: string;
};

export function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  name,
}: Props) {
  return (
    <div className="input-group">
      <input
        className="input"
        type={type}
        value={value}
        name={name}
        required={required}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
      <label className="user-label">{label}</label>
    </div>
  );
}
