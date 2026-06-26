"use client";
import { useState, useCallback } from "react";
import { getVendorTypeConfig } from "@/lib/vendorTypeConfigs";
import ContractPayment from "./ContractPayment";
import IntakeForm from "./IntakeForm";
import TimelinePlanner from "./TimelinePlanner";
import LogisticsPanel from "./LogisticsPanel";
import FileVault from "./FileVault";
import DeliverablesTracker from "./DeliverablesTracker";
import ChecklistDeadlines from "./ChecklistDeadlines";
import GuestDataPanel from "./GuestDataPanel";
import MoodboardUploader from "./MoodboardUploader";
import ApprovalButton from "./ApprovalButton";
import PhotoUploadPanel from "./PhotoUploadPanel";

interface Deliverable {
  id: string;
  key: string;
  label: string;
  status: string;
  dueDate?: string | null;
  approvalRequired: boolean;
  notes?: string | null;
  fileUrl?: string | null;
}

interface Props {
  weddingId: string;
  wvId: string;
  vendorType: string;
  initialBooking: {
    status: string;
    depositAmount?: number | null;
    depositDue?: string | null;
    depositPaid: boolean;
    finalAmount?: number | null;
    finalDue?: string | null;
    finalPaid: boolean;
    contractUrl?: string | null;
    intakeData?: Record<string, unknown> | null;
  };
  initialDeliverables: Deliverable[];
  documents: Array<{ id: string; name: string; fileKey: string; mimeType: string; fileSize: number; category: string; createdAt: string }>;
  timelineBlocks: Array<{ id: string; startTime: string; duration: number; title: string; description?: string | null; location?: string | null; phase?: string | null }>;
  tasks: Array<{ id: string; title: string; status: string; dueDate?: string | null; priority: string }>;
  guests: Array<{ id: string; name: string; dietary?: string | null; rsvpStatus: string; side: string }>;
  totalGuests: number;
  userRole: string;
  userId: string;
  vendorUserId?: string | null;
}

export default function DashboardEngine({
  weddingId, wvId, vendorType, initialBooking, initialDeliverables,
  documents, timelineBlocks, tasks, guests, totalGuests, userRole, userId, vendorUserId,
}: Props) {
  const config = getVendorTypeConfig(vendorType);
  const [booking, setBooking] = useState(initialBooking);
  const [deliverables, setDeliverables] = useState(initialDeliverables);

  const isPlanner = ["admin", "planner", "team_member"].includes(userRole);
  const isVendor = userRole === "vendor" && vendorUserId === userId;
  const intakeData = (booking.intakeData ?? {}) as Record<string, unknown>;

  const modules = config.modules ?? [];
  const hasIntake = (config.intakeFields?.length ?? 0) > 0;
  const hasLogistics = (config.logisticsFields?.length ?? 0) > 0;
  const hasDeliverables = (config.deliverables?.length ?? 0) > 0;
  const hasTimeline = (config.timelineTemplate?.length ?? 0) > 0;
  const showFileVault = !modules.includes("documentUpload") && modules.includes("fileVault");

  const patchBooking = useCallback(async (patch: Record<string, unknown>) => {
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const { booking: updated } = await res.json();
      setBooking(updated);
    }
  }, [weddingId, wvId]);

  const patchIntake = useCallback(async (newData: Record<string, unknown>) => {
    const merged = { ...intakeData, ...newData };
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}/intake`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intakeData: merged }),
    });
    if (res.ok) {
      const { booking: updated } = await res.json();
      setBooking(updated);
    }
  }, [weddingId, wvId, intakeData]);

  const updateDeliverable = useCallback(async (id: string, patch: Record<string, unknown>) => {
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}/deliverables/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
    });
    if (res.ok) {
      const { deliverable } = await res.json();
      setDeliverables(prev => prev.map(d => d.id === id ? deliverable : d));
    }
  }, [weddingId, wvId]);

  const addDeliverable = useCallback(async (d: Omit<Deliverable, "id">) => {
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}/deliverables`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d),
    });
    if (res.ok) {
      const { deliverable } = await res.json();
      setDeliverables(prev => [...prev, deliverable]);
    }
  }, [weddingId, wvId]);

  const deleteDeliverable = useCallback(async (id: string) => {
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}/deliverables/${id}`, { method: "DELETE" });
    if (res.ok) setDeliverables(prev => prev.filter(d => d.id !== id));
  }, [weddingId, wvId]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <ContractPayment
        weddingId={weddingId}
        wvId={wvId}
        depositAmount={booking.depositAmount}
        depositDue={booking.depositDue}
        depositPaid={booking.depositPaid}
        finalAmount={booking.finalAmount}
        finalDue={booking.finalDue}
        finalPaid={booking.finalPaid}
        contractUrl={booking.contractUrl}
        onUpdate={patchBooking}
        isPlanner={isPlanner}
      />


      {modules.includes("photoUpload") && (
        <PhotoUploadPanel
          intakeData={intakeData}
          onUpdate={patchIntake}
          isVendor={isVendor}
          isPlanner={isPlanner}
          weddingId={weddingId}
          wvId={wvId}
        />
      )}

      {(modules.includes("documentUpload") || showFileVault) && (
        <FileVault documents={documents} weddingId={weddingId} wvId={wvId} isPlanner={isPlanner} isVendor={isVendor} />
      )}

      {hasTimeline && (
        <TimelinePlanner
          blocks={timelineBlocks}
          templates={config.timelineTemplate!}
          weddingId={weddingId}
          wvId={wvId}
          isPlanner={isPlanner}
          isVendor={isVendor}
        />
      )}

      {hasLogistics && (
        <LogisticsPanel
          fields={config.logisticsFields!}
          intakeData={intakeData}
          onUpdate={patchIntake}
          isPlanner={isPlanner}
          isVendor={isVendor}
        />
      )}

      {hasIntake && (
        <IntakeForm
          weddingId={weddingId}
          wvId={wvId}
          fields={config.intakeFields!}
          intakeData={intakeData}
          onUpdate={patchIntake}
          isPlanner={isPlanner}
          isVendor={isVendor}
        />
      )}

      {hasDeliverables && (
        <DeliverablesTracker
          weddingId={weddingId}
          wvId={wvId}
          deliverables={deliverables}
          configs={config.deliverables!}
          isPlanner={isPlanner}
          isVendor={isVendor}
          onUpdate={updateDeliverable}
          onAdd={addDeliverable}
          onDelete={deleteDeliverable}
        />
      )}

      {modules.includes("moodboardUploader") && (
        <MoodboardUploader intakeData={intakeData} onUpdate={patchIntake} isVendor={isVendor} />
      )}

      {modules.includes("guestDataPanel") && config.readsGuestData && (
        <GuestDataPanel guests={guests} weddingId={weddingId} totalGuests={totalGuests} />
      )}

      {modules.includes("checklistDeadlines") && (
        <ChecklistDeadlines tasks={tasks} weddingId={weddingId} />
      )}


      {isPlanner && (
        <ApprovalButton status={booking.status} onUpdate={patchBooking} isPlanner={isPlanner} />
      )}
    </div>
  );
}
