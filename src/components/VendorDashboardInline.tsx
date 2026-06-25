"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import DashboardEngine from "@/components/vendor-modules/DashboardEngine";

interface Props {
  weddingId: string;
  wvId: string;
  vendorName: string;
  vendorCategory: string;
  userRole: string;
  userId: string;
  vendorUserId?: string | null;
}

export default function VendorDashboardInline({ weddingId, wvId, vendorName, vendorCategory, userRole, userId, vendorUserId }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<null | {
    booking: Parameters<typeof DashboardEngine>[0]["initialBooking"];
    deliverables: Parameters<typeof DashboardEngine>[0]["initialDeliverables"];
    documents: Parameters<typeof DashboardEngine>[0]["documents"];
    timelineBlocks: Parameters<typeof DashboardEngine>[0]["timelineBlocks"];
    tasks: Parameters<typeof DashboardEngine>[0]["tasks"];
    guests: Parameters<typeof DashboardEngine>[0]["guests"];
    totalGuests: number;
  }>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || data) return;
    setLoading(true);
    fetch(`/api/weddings/${weddingId}/vendors/${wvId}`)
      .then(r => r.json())
      .then(json => {
        const b = json.booking ?? json;
        setData({
          booking: {
            status: b.status,
            depositAmount: b.depositAmount ?? null,
            depositDue: b.depositDue ?? null,
            depositPaid: b.depositPaid ?? false,
            finalAmount: b.finalAmount ?? null,
            finalDue: b.finalDue ?? null,
            finalPaid: b.finalPaid ?? false,
            contractUrl: b.contractUrl ?? null,
            intakeData: b.intakeData ?? null,
          },
          deliverables: b.deliverables ?? [],
          documents: b.documents ?? [],
          timelineBlocks: b.draaiboekItems ?? [],
          tasks: b.tasks ?? [],
          guests: [],
          totalGuests: 0,
        });
      })
      .finally(() => setLoading(false));
  }, [open, data, weddingId, wvId]);

  return (
    <div className="ddp-card">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 text-left"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "var(--accent)", color: "var(--primary)" }}>
          {vendorName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{vendorName}</div>
          <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{vendorCategory}</div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted)" }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted)" }} />}
      </button>

      {open && (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          {loading && <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>Laden...</p>}
          {!loading && data && (
            <DashboardEngine
              weddingId={weddingId}
              wvId={wvId}
              vendorType={vendorCategory}
              initialBooking={data.booking}
              initialDeliverables={data.deliverables}
              documents={data.documents}
              timelineBlocks={data.timelineBlocks}
              tasks={data.tasks}
              guests={data.guests}
              totalGuests={data.totalGuests}
              userRole={userRole}
              userId={userId}
              vendorUserId={vendorUserId}
            />
          )}
        </div>
      )}
    </div>
  );
}
