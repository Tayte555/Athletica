type Props = {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
};

export default function MultiSelectChips({
  label,
  options,
  values,
  onChange,
}: Props) {
  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleValue(option)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-[#333] hover:bg-black/5"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
