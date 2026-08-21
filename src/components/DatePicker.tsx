"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];
const DAGEN = ["ma", "di", "wo", "do", "vr", "za", "zo"];

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fromIso(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function formatDisplay(s: string) {
  const d = fromIso(s);
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}
function parseTyped(s: string): string | null {
  const m = s.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (d.getFullYear() !== Number(yyyy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return null;
  return toIso(d);
}

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "dd-mm-jjjj",
  className = "ddp-input",
  style,
}: {
  value: string;
  onChange: (isoDate: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const selected = fromIso(value);
  const minDate = fromIso(min ?? "");
  const maxDate = fromIso(max ?? "");
  const [viewDate, setViewDate] = useState(() => selected ?? new Date());
  const wrapRef = useRef<HTMLDivElement>(null);
  const [typedValue, setTypedValue] = useState(formatDisplay(value));
  const [typedFocused, setTypedFocused] = useState(false);

  useEffect(() => {
    if (!typedFocused) setTypedValue(formatDisplay(value));
  }, [value, typedFocused]);

  useEffect(() => {
    if (open) setViewDate(selected ?? new Date());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("pointerdown", onClick, true);
    return () => document.removeEventListener("pointerdown", onClick, true);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // maandag = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function isDisabled(d: Date) {
    if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  }
  function isSame(a: Date, b: Date | null) {
    return !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div className={className} style={{ display: "flex", alignItems: "center", gap: "0.5rem", ...style }}>
        <input
          type="text"
          inputMode="numeric"
          value={typedValue}
          placeholder={placeholder}
          onFocus={() => setTypedFocused(true)}
          onChange={(e) => setTypedValue(e.target.value)}
          onBlur={() => {
            setTypedFocused(false);
            const iso = parseTyped(typedValue);
            if (iso) {
              const d = fromIso(iso)!;
              if (!isDisabled(d)) { onChange(iso); return; }
            }
            // Ongeldige of buiten-bereik invoer: terug naar de laatst geldige waarde
            // i.p.v. de bruidspaar/leverancier stil op een foute datum te laten staan.
            setTypedValue(formatDisplay(value));
          }}
          style={{ border: "none", outline: "none", background: "transparent", flex: 1, minWidth: 0, color: value || typedFocused ? "var(--foreground)" : "var(--muted-light)" }}
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label="Kalender openen"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}
        >
          <Calendar style={{ width: "15px", height: "15px", color: "var(--muted-light)" }} />
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 40,
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.10)", padding: "1rem", width: "290px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="Vorige maand"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", color: "var(--muted)", display: "flex" }}>
              <ChevronLeft style={{ width: "16px", height: "16px" }} />
            </button>
            <span className="font-serif" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--foreground)", textTransform: "capitalize" }}>
              {MAANDEN[month]} {year}
            </span>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label="Volgende maand"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", color: "var(--muted)", display: "flex" }}>
              <ChevronRight style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "0.25rem" }}>
            {DAGEN.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "var(--muted-light)", padding: "0.25rem 0" }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const disabled = isDisabled(d);
              const isSelected = isSame(d, selected);
              const isToday = isSame(d, today);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => { flushSync(() => { onChange(toIso(d)); setOpen(false); }); }}
                  style={{
                    aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "8px", border: "none", fontSize: "0.8125rem", cursor: disabled ? "default" : "pointer",
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? "var(--gold)" : "transparent",
                    color: disabled ? "var(--muted-light)" : isSelected ? "var(--ink)" : isToday ? "var(--gold-deep)" : "var(--foreground)",
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
            <button type="button" onClick={() => { flushSync(() => { onChange(""); setOpen(false); }); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, color: "var(--muted)", padding: 0 }}>
              Wissen
            </button>
            <button type="button" onClick={() => { const t = new Date(); t.setHours(0, 0, 0, 0); if (!isDisabled(t)) { flushSync(() => { onChange(toIso(t)); setOpen(false); }); } }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gold-deep)", padding: 0 }}>
              Vandaag
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
