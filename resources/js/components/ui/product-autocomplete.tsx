import { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface ProductOption {
  id: number;
  name: string;
  quantite?: number;
  [key: string]: any;
}

interface ProductAutocompleteProps {
  value: string;
  onChange: (value: string, selected?: ProductOption) => void;
  options: ProductOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  displayQuantity?: boolean;
  allowZeroQuantitySelect?: boolean;
}

export function ProductAutocomplete({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
  className,
  displayQuantity = true,
  allowZeroQuantitySelect = false,
}: ProductAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const ref = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!value) return options;
    return options.filter(opt =>
      opt.name.toLowerCase().includes(value.toLowerCase())
    );
  }, [value, options]);

  useEffect(() => {
    setHighlighted(-1);
  }, [filtered.length, open]);

  useEffect(() => {
    if (!open) setHighlighted(-1);
  }, [open]);

  const handleSelect = (option: ProductOption) => {
    // Only set the value to the selected option
    onChange(option.name, option);
    setOpen(false);
    setHighlighted(-1);
    // Optionally, you could blur the input here: ref.current?.blur();
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        ref={ref}
        value={value}
        onChange={e => {
          onChange(e.target.value, undefined);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="product-autocomplete-list"
        className={cn(error && 'border-destructive ring-destructive/20')}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-border/60 bg-background shadow-lg">
          <ul id="product-autocomplete-list" className="max-h-48 overflow-auto py-1 text-sm">
            {filtered.map((option, idx) => {
              const isZero = option.quantite === 0;
              const isDisabled = isZero && !allowZeroQuantitySelect;
              return (
                <li
                  key={option.id}
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-2',
                    isZero ? 'opacity-60 text-destructive bg-muted/40' : '',
                    isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
                    idx === highlighted && !isDisabled && 'bg-accent'
                  )}
                  onMouseDown={e => {
                    if (isDisabled) return;
                    e.preventDefault();
                    handleSelect(option);
                  }}
                  onMouseEnter={() => {
                    if (!isDisabled) setHighlighted(idx);
                  }}
                  aria-disabled={isDisabled}
                >
                  <span>{option.name}</span>
                  {displayQuantity && (
                    <span className="ml-2 text-xs">
                      Qté: {option.quantite ?? '-'}
                      {isZero && (
                        <span className="ml-2 rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive">Rupture</span>
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
