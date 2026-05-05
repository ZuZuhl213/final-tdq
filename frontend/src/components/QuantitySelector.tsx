interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({ value, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  const handleDecrease = () => onChange(Math.max(min, value - 1));
  const handleIncrease = () => onChange(Math.min(max, value + 1));

  return (
    <div className="quantity-selector">
      <button type="button" onClick={handleDecrease}>
        -
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <button type="button" onClick={handleIncrease}>
        +
      </button>
    </div>
  );
}
