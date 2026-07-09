"use client";
import { useState, useEffect } from "react";
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
  const [data, setData] = useState<null | {
    booking: Parameters<typeof DashboardEngine>[0]["initialBooking"];
    documents: Parameters<typeof DashboardEngine>[0]["documents"];
    timelineBlocks: Parameters<typeof DashboardEngine>[0]["timelineBlocks"];
    tasks: Parameters<typeof DashboardEngine>[0]["tasks"];
    guests: Parameters<typeof DashboardEngine>[0]["guests"];
    totalGuests: number;
    vendorIsPremium: boolean;
    vendorDisabledModules: string[];
    vendorExtraModules: string[];
  }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          documents: b.documents ?? [],
          timelineBlocks: b.draaiboekItems ?? [],
          tasks: b.tasks ?? [],
          guests: [],
          totalGuests: 0,
          vendorIsPremium: b.vendor?.isPremium ?? false,
          vendorDisabledModules: b.vendor?.disabledModules ?? [],
          vendorExtraModules: b.vendor?.extraModules ?? [],
        });
      })
      .finally(() => setLoading(false));
  }, [weddingId, wvId]);

  return (
    <div className="ddp-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "var(--accent)", color: "var(--primary)" }}>
          {vendorName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{vendorName}</div>
          <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{vendorCategory}</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
        {loading && <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>Laden...</p>}
        {!loading && data && (
          <DashboardEngine
            weddingId={weddingId}
            wvId={wvId}
            vendorType={vendorCategory}
            initialBooking={data.booking}
            documents={data.documents}
            timelineBlocks={data.timelineBlocks}
            tasks={data.tasks}
            guests={data.guests}
            totalGuests={data.totalGuests}
            userRole={userRole}
            userId={userId}
            vendorUserId={vendorUserId}
            vendorIsPremium={data.vendorIsPremium}
            vendorDisabledModules={data.vendorDisabledModules}
            vendorExtraModules={data.vendorExtraModules}
          />
        )}
      </div>
    </div>
  );
}
