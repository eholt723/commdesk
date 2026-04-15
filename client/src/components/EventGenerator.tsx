import { useState } from 'react';

interface Props {
  onFire: () => void;
  disabled?: boolean;
}

export function EventGenerator({ onFire, disabled = false }: Props) {
  const [firing, setFiring] = useState(false);

  function handleFire() {
    if (firing || disabled) return;
    setFiring(true);
    onFire();
    setTimeout(() => setFiring(false), 800);
  }

  return (
    <button
      onClick={handleFire}
      disabled={disabled || firing}
      className={`
        px-6 py-3 rounded-xl font-semibold text-sm tracking-wide
        transition-all duration-200 shadow-lg
        ${
          disabled
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : firing
            ? 'bg-indigo-400 text-white scale-95'
            : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white cursor-pointer'
        }
      `}
    >
      {firing ? 'Firing...' : 'Fire Event'}
    </button>
  );
}
