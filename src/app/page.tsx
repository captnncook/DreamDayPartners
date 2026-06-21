import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LandingPage from "@/components/LandingPage";

export default async function HomePage() {
  const user = await getSession();
  if (user) redirect("/dashboard");
  return <LandingPage />;
}
