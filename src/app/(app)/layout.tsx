import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav user={user} />
        <main className="flex-1 min-w-0 overflow-auto" style={{ background: "var(--background)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
