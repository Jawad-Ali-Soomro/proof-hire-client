import { useEffect, useMemo, useRef, useState } from "react";
import { PiCaretDown, PiCheck } from "react-icons/pi";

export default function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#26b69c] dark:border-gray-800 ${className}`}
      >
        <span className="truncate text-left">
          {selected?.label ?? placeholder}
        </span>
        <PiCaretDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute z-[80] mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-start h-10 justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                value === opt.value
                  ? "bg-[#26b69c]/10 text-[#156b59] dark:text-[#56d9c0]"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{opt.label}</span>
                {opt.description ? (
                  <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                    {opt.description}
                  </span>
                ) : null}
              </span>
              {value === opt.value ? <PiCheck className="shrink-0" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

