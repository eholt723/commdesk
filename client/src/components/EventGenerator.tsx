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
        bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors
        ${disabled || firing ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {firing ? 'Firing...' : 'Fire Event'}
    </button>
  );
}
