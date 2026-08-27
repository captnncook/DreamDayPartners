"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/reportClientError";

// Vangt onbehandelde JS-fouten en promise-rejecties die buiten React's eigen
// render-cyclus vallen (en dus niet door een error.tsx-boundary worden
// opgevangen), zodat ook die in het admin-foutenlog terechtkomen.
export default function ClientErrorReporter() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportClientError(event.error ?? event.message, undefined, { kind: "window.onerror" });
    }
    function onRejection(event: PromiseRejectionEvent) {
      reportClientError(event.reason, undefined, { kind: "unhandledrejection" });
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
