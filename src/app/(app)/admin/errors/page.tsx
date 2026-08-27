import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ErrorsClient from "./ErrorsClient";

export default async function AdminErrorsPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return <ErrorsClient />;
}
