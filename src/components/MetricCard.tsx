type Props = {
  label: string;
  value: string;
  helper?: string;
};

export function MetricCard({ label, value, helper }: Props) {
  return (
    <div className="card">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  );
}
