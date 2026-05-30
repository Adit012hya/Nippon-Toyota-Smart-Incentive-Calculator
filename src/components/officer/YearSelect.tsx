import { useEffect, useRef, useState } from 'react';
import { getAvailableYears } from '../../lib/salesPeriod';

const VISIBLE_COUNT = 5;
const ITEM_HEIGHT_PX = 40;

interface Props {
  id?: string;
  value: number;
  onChange: (year: number) => void;
}

export function YearSelect({ id = 'year-select', value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const years = getAvailableYears();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    if (selected instanceof HTMLElement) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [open, value]);

  const pick = (year: number) => {
    onChange(year);
    setOpen(false);
  };

  return (
    <div className="year-select" ref={rootRef}>
      <button
        type="button"
        id={id}
        className="year-select-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Year ${value}`}
      >
        <span>{value}</span>
        <span className="year-select-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="year-select-dropdown" role="presentation">
          <ul
            ref={listRef}
            className="year-select-list"
            role="listbox"
            aria-label="Select year"
            style={{ maxHeight: VISIBLE_COUNT * ITEM_HEIGHT_PX }}
          >
            {years.map((y) => (
              <li key={y} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={y === value}
                  data-selected={y === value ? 'true' : 'false'}
                  className={`year-select-option${y === value ? ' year-select-option-active' : ''}`}
                  style={{ height: ITEM_HEIGHT_PX }}
                  onClick={() => pick(y)}
                >
                  {y}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
