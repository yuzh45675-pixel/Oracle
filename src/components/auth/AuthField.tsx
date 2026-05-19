"use client";

type AuthFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string | null;
};

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}: AuthFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs tracking-widest text-muted uppercase">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-xl border bg-white/[0.04] px-4 py-2.5 text-sm text-frost outline-none transition-colors placeholder:text-muted/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/30 ${
          error ? "border-red-500/50" : "border-white/[0.08]"
        }`}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
