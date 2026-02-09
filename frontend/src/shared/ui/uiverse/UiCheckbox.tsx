import "@/shared/styles/uiverse/UiCheckbox.css";

type Props = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export function UiCheckbox({ checked, onChange, disabled }: Props) {
  return (
    <input
      type="checkbox"
      className="ui-checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  );
}
