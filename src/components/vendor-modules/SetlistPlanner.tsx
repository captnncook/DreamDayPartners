"use client";

import { useState } from "react";
import { Music, Plus, Trash2, GripVertical, Heart, X } from "lucide-react";

type Song = { id: string; title: string; artist: string; moment: string; doNotPlay: boolean };

const MOMENTS = ["Inkomst bruid", "Ceremonie", "Eerste dans", "Diner", "Feest", "Afsluiting", "Anders"];

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function SetlistPlanner({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const rawSongs = intakeData.setlistSongs as Song[] | undefined;
  const [songs, setSongs] = useState<Song[]>(rawSongs ?? []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", artist: "", moment: "Feest", doNotPlay: false });

  function save(updated: Song[]) {
    setSongs(updated);
    onUpdate({ setlistSongs: updated });
  }

  function addSong(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const newSong: Song = { id: `s-${Date.now()}`, title: form.title.trim(), artist: form.artist.trim(), moment: form.moment, doNotPlay: form.doNotPlay };
    save([...songs, newSong]);
    setForm({ title: "", artist: "", moment: "Feest", doNotPlay: false });
    setShowForm(false);
  }

  function removeSong(id: string) {
    save(songs.filter(s => s.id !== id));
  }

  const wantList = songs.filter(s => !s.doNotPlay);
  const doNotList = songs.filter(s => s.doNotPlay);

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <h3 className="font-semibold text-sm">Setlist & Muziekwensen</h3>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(!showForm)} className="ddp-btn-primary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <Plus className="w-3.5 h-3.5" /> Nummer toevoegen
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={addSong} className="mb-4 p-3 rounded-xl space-y-3" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Titel *</label>
              <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Nummer titel" className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Artiest</label>
              <input value={form.artist} onChange={e => setForm(p => ({ ...p, artist: e.target.value }))}
                placeholder="Artiest naam" className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium mb-1">Moment</label>
              <select value={form.moment} onChange={e => setForm(p => ({ ...p, moment: e.target.value }))}
                className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white" style={{ borderColor: "var(--border)" }}>
                {MOMENTS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm pb-1.5">
              <input type="checkbox" checked={form.doNotPlay} onChange={e => setForm(p => ({ ...p, doNotPlay: e.target.checked }))} className="w-4 h-4" />
              Do-not-play
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="ddp-btn-primary" style={{ padding: "0.4rem 0.875rem", fontSize: "0.8125rem" }}>Toevoegen</button>
            <button type="button" onClick={() => setShowForm(false)} className="ddp-btn-secondary" style={{ padding: "0.4rem 0.875rem", fontSize: "0.8125rem" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {songs.length === 0 && (
        <div className="text-center py-8" style={{ color: "var(--muted)" }}>
          <Music className="w-7 h-7 mx-auto mb-2" style={{ color: "var(--accent-dark)" }} />
          <p className="text-sm">Nog geen nummers toegevoegd. Voeg must-plays en do-not-plays toe.</p>
        </div>
      )}

      {wantList.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Heart className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--success)" }}>Must play ({wantList.length})</span>
          </div>
          <div className="space-y-1.5">
            {wantList.map(song => (
              <div key={song.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
                <GripVertical className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--muted)" }} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{song.title}</span>
                  {song.artist && <span className="text-xs ml-1.5" style={{ color: "var(--muted)" }}>– {song.artist}</span>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "var(--border)", color: "var(--muted)" }}>{song.moment}</span>
                {canEdit && (
                  <button onClick={() => removeSong(song.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", flexShrink: 0 }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {doNotList.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <X className="w-3.5 h-3.5" style={{ color: "var(--danger)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--danger)" }}>Do not play ({doNotList.length})</span>
          </div>
          <div className="space-y-1.5">
            {doNotList.map(song => (
              <div key={song.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "#fff5f5", border: "1px solid #fecaca" }}>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{song.title}</span>
                  {song.artist && <span className="text-xs ml-1.5" style={{ color: "var(--muted)" }}>– {song.artist}</span>}
                </div>
                {canEdit && (
                  <button onClick={() => removeSong(song.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", flexShrink: 0 }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
