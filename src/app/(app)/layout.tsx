import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar user={user} />
      <main
        className="min-h-screen lg:ml-64 pt-14 lg:pt-0 overflow-auto"
        style={{ background: "var(--background)" }}
      >
        {children}
      </main>
    </div>
  );
}
