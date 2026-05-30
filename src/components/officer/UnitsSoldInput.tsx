interface Props {
  modelId: string;
  value: number;
  onChange: (modelId: string, value: string) => void;
}

export function UnitsSoldInput({ modelId, value, onChange }: Props) {
  const displayValue = value === 0 ? '' : String(value);

  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      value={displayValue}
      onChange={(e) => onChange(modelId, e.target.value)}
      placeholder="0"
      aria-label="Units sold"
    />
  );
}
