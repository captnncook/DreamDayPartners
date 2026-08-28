import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ActivityClient from "./ActivityClient";

export default async function AdminActivityPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return <ActivityClient />;
}
