import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminLogin cases={projects.map((p) => ({ slug: p.slug, title: p.title, tab: p.tab }))} />;
}
