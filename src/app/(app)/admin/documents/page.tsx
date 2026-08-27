import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DocumentsClient from "./DocumentsClient";

export default async function AdminDocumentsPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return <DocumentsClient />;
}
