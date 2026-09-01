import { DashboardShell } from "@/components/DashboardShell";
import { connection } from "next/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return (
    <DashboardShell siteUrl={process.env.SITE_URL || "http://localhost:3000"}>
      {children}
    </DashboardShell>
  );
}
