import { getSession } from "@/lib/session";
import LandingPage from "@/components/LandingPage";

export default async function HomePage() {
  const user = await getSession();
  return <LandingPage isLoggedIn={!!user} />;
}
