"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Weergave- en exportformaat delen dezelfde 3:4-verhouding, zodat de
// uiteindelijke schild-"slice" (xMidYMid slice) precies laat zien wat de
// leverancier hier heeft gepositioneerd.
const BOX_W = 260;
const BOX_H = 347;
const OUT_W = 600;
const OUT_H = 800;
const SCALE_FACTOR = OUT_W / BOX_W;

export default function ShieldPhotoCropper({
  file,
  onCancel,
  onCropped,
}: {
  file: File;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const baseScale = natural ? Math.max(BOX_W / natural.w, BOX_H / natural.h) : 1;
  const effectiveScale = baseScale * zoom;

  const clamp = useCallback((next: { x: number; y: number }, s: number) => {
    if (!natural) return next;
    const dispW = natural.w * s;
    const dispH = natural.h * s;
    const maxX = Math.max(0, (dispW - BOX_W) / 2);
    const maxY = Math.max(0, (dispH - BOX_H) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }, [natural]);

  function onImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    setPos({ x: 0, y: 0 });
    setZoom(1);
  }

  function onPointerDown(e: React.PointerEvent) {
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { /* not all pointer types support capture */ }
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const next = clamp({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy }, effectiveScale);
    setPos(next);
  }
  function onPointerUp() { dragRef.current = null; }

  function handleZoom(next: number) {
    setZoom(next);
    setPos((p) => clamp(p, baseScale * next));
  }

  function handleSave() {
    if (!natural || !imgRef.current) return;
    setSaving(true);
    const canvas = document.createElement("canvas");
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setSaving(false); return; }
    const outScale = effectiveScale * SCALE_FACTOR;
    const dw = natural.w * outScale;
    const dh = natural.h * outScale;
    const dx = OUT_W / 2 - dw / 2 + pos.x * SCALE_FACTOR;
    const dy = OUT_H / 2 - dh / 2 + pos.y * SCALE_FACTOR;
    ctx.drawImage(imgRef.current, dx, dy, dw, dh);
    canvas.toBlob((blob) => {
      setSaving(false);
      if (blob) onCropped(blob);
    }, "image/jpeg", 0.92);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--background)", borderRadius: "20px", padding: "1.5rem", maxWidth: "360px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}
      >
        <h3 className="font-serif" style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "var(--space-1)" }}>Foto plaatsen</h3>
        <p style={{ fontSize: "var(--text-base)", color: "var(--muted)", marginBottom: "var(--space-6)" }}>
          Sleep de foto om te verplaatsen en gebruik de schuif om in of uit te zoomen.
        </p>

        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{
            position: "relative", width: BOX_W, height: BOX_H, margin: "0 auto",
            overflow: "hidden", borderRadius: "12px", background: "var(--ink)",
            cursor: dragRef.current ? "grabbing" : "grab", touchAction: "none", userSelect: "none",
          }}
        >
          {imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={imgUrl}
              alt=""
              draggable={false}
              onLoad={onImgLoad}
              style={
                natural
                  ? {
                      position: "absolute", left: "50%", top: "50%",
                      width: natural.w * effectiveScale,
                      height: natural.h * effectiveScale,
                      maxWidth: "none",
                      transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                      pointerEvents: "none",
                    }
                  : {
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "cover", opacity: 0.4, pointerEvents: "none",
                    }
              }
            />
          )}
          {/* Decoratieve schildomtrek als richtlijn — geen interactie */}
          <svg viewBox="0 0 100 133" width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path
              d="M50 3 L90 18 L90 60 C90 84 72 104 50 114 C28 104 10 84 10 60 L10 18 Z"
              fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"
            />
          </svg>
        </div>

        <input
          type="range" min={1} max={3} step={0.01} value={zoom}
          onChange={(e) => handleZoom(parseFloat(e.target.value))}
          className="ddp-range"
          style={{ marginTop: "var(--space-7)" }}
        />

        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} disabled={!natural || saving} className="ddp-btn-primary">
            {saving ? "Bezig…" : "Opslaan"}
          </button>
          <button onClick={onCancel} className="ddp-btn-secondary">Annuleren</button>
        </div>
      </div>
    </div>
  );
}
