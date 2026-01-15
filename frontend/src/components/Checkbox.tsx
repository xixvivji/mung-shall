interface CheckboxProps {
  label: string | React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  required?: boolean;
}

export function Checkbox({ label, checked = false, onChange, required = false }: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-5 h-5 mt-0.5 rounded border-2 border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 cursor-pointer transition-all"
      />
      <span className="text-sm text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text))] transition-colors">
        {label}
        {required && <span className="text-[hsl(var(--primary))] ml-1">*</span>}
      </span>
    </label>
  );
}
