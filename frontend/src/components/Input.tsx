interface InputProps {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
}

export function Input({
  label,
  type = 'text',
  placeholder,
  required = false,
  error,
  value,
  onChange,
  helperText,
}: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[hsl(var(--secondary))]">
        {label}
        {required && <span className="text-[hsl(var(--primary))] ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full h-12 px-4 rounded-xl border transition-all duration-200 ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20'
        } focus:outline-none disabled:bg-[hsl(var(--surface))] disabled:cursor-not-allowed`}
      />
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-[hsl(var(--text-secondary))]">{helperText}</p>
      )}
    </div>
  );
}
