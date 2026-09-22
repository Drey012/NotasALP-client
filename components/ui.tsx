import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

export function NumberField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        max="10"
        step="0.1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="0,0"
      />
    </label>
  );
}

export function Metric({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function Feedback({
  kind,
  children,
}: {
  kind: "error" | "success" | "loading";
  children: React.ReactNode;
}) {
  const Icon =
    kind === "error"
      ? AlertCircle
      : kind === "success"
        ? CheckCircle2
        : LoaderCircle;
  return (
    <p className={`feedback ${kind}`}>
      <Icon size={15} />
      {children}
    </p>
  );
}
