"use client";

import { useState } from "react";
import { ChefHat, Plus, Trash2, Edit2, Check, X } from "lucide-react";

type Course = { id: string; name: string; description: string; pricePerPerson?: number };
type MenuSection = { id: string; title: string; courses: Course[] };

const DEFAULT_SECTIONS: Omit<MenuSection, "courses">[] = [
  { id: "starter", title: "Voorgerecht" },
  { id: "main", title: "Hoofdgerecht" },
  { id: "dessert", title: "Dessert" },
  { id: "extra", title: "Extra / Tussendoor" },
];

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function MenuBuilder({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const rawMenu = intakeData.menuSections as MenuSection[] | undefined;
  const [sections, setSections] = useState<MenuSection[]>(
    rawMenu ?? DEFAULT_SECTIONS.map(s => ({ ...s, courses: [] }))
  );
  const [editingCourse, setEditingCourse] = useState<{ sectionId: string; courseId: string | null } | null>(null);
  const [courseForm, setCourseForm] = useState({ name: "", description: "", pricePerPerson: "" });

  function save(updated: MenuSection[]) {
    setSections(updated);
    onUpdate({ menuSections: updated });
  }

  function startAddCourse(sectionId: string) {
    setEditingCourse({ sectionId, courseId: null });
    setCourseForm({ name: "", description: "", pricePerPerson: "" });
  }

  function startEditCourse(sectionId: string, course: Course) {
    setEditingCourse({ sectionId, courseId: course.id });
    setCourseForm({ name: course.name, description: course.description, pricePerPerson: course.pricePerPerson != null ? String(course.pricePerPerson) : "" });
  }

  function saveCourse() {
    if (!editingCourse || !courseForm.name.trim()) return;
    const { sectionId, courseId } = editingCourse;
    const newCourse: Course = {
      id: courseId ?? `c-${Date.now()}`,
      name: courseForm.name.trim(),
      description: courseForm.description.trim(),
      pricePerPerson: courseForm.pricePerPerson ? Number(courseForm.pricePerPerson) : undefined,
    };
    const updated = sections.map(s =>
      s.id === sectionId
        ? { ...s, courses: courseId ? s.courses.map(c => c.id === courseId ? newCourse : c) : [...s.courses, newCourse] }
        : s
    );
    save(updated);
    setEditingCourse(null);
  }

  function deleteCourse(sectionId: string, courseId: string) {
    save(sections.map(s => s.id === sectionId ? { ...s, courses: s.courses.filter(c => c.id !== courseId) } : s));
  }

  return (
    <div className="ddp-card">
      <div className="flex items-center gap-2 mb-4">
        <ChefHat className="w-4 h-4" style={{ color: "var(--primary)" }} />
        <h3 className="font-semibold text-sm">Menu builder</h3>
      </div>

      <div className="space-y-5">
        {sections.map(section => (
          <div key={section.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{section.title}</span>
              {canEdit && (
                <button onClick={() => startAddCourse(section.id)} style={{ fontSize: "0.75rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <Plus className="w-3 h-3" /> Gang toevoegen
                </button>
              )}
            </div>

            {editingCourse?.sectionId === section.id && editingCourse.courseId === null && (
              <div className="mb-2 p-3 rounded-xl space-y-2" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
                <input value={courseForm.name} onChange={e => setCourseForm(p => ({ ...p, name: e.target.value }))} placeholder="Naam gerecht *"
                  className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
                <input value={courseForm.description} onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} placeholder="Omschrijving (optioneel)"
                  className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
                <div className="flex gap-2 items-center">
                  <input type="number" step="0.01" value={courseForm.pricePerPerson} onChange={e => setCourseForm(p => ({ ...p, pricePerPerson: e.target.value }))} placeholder="€ per persoon"
                    className="w-32 border rounded-lg px-3 py-1.5 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
                  <button onClick={saveCourse} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", padding: "0.3rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem" }}>
                    <Check className="w-3.5 h-3.5" /> Opslaan
                  </button>
                  <button onClick={() => setEditingCourse(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {section.courses.length === 0 && editingCourse?.sectionId !== section.id && (
              <p style={{ fontSize: "0.8125rem", color: "var(--muted)", fontStyle: "italic" }}>Nog geen gerechten.</p>
            )}

            <div className="space-y-1.5">
              {section.courses.map(course => (
                <div key={course.id}>
                  {editingCourse?.courseId === course.id ? (
                    <div className="p-3 rounded-xl space-y-2" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
                      <input value={courseForm.name} onChange={e => setCourseForm(p => ({ ...p, name: e.target.value }))} placeholder="Naam *"
                        className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
                      <input value={courseForm.description} onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} placeholder="Omschrijving"
                        className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
                      <div className="flex gap-2 items-center">
                        <input type="number" step="0.01" value={courseForm.pricePerPerson} onChange={e => setCourseForm(p => ({ ...p, pricePerPerson: e.target.value }))} placeholder="€ per persoon"
                          className="w-32 border rounded-lg px-3 py-1.5 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
                        <button onClick={saveCourse} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", padding: "0.3rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem" }}>
                          <Check className="w-3.5 h-3.5" /> Opslaan
                        </button>
                        <button onClick={() => setEditingCourse(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{course.name}</div>
                        {course.description && <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{course.description}</div>}
                        {course.pricePerPerson != null && (
                          <div className="text-xs mt-0.5" style={{ color: "var(--primary)", fontWeight: 600 }}>€{course.pricePerPerson.toFixed(2)} p.p.</div>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => startEditCourse(section.id, course)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteCourse(section.id, course.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
