import type { Metadata } from "next";
import { SectionLabel } from "@/components/SectionLabel";
import { ProjectCard } from "@/components/ProjectCard";
import { Contact } from "@/components/Contact";
import { getProjects } from "@/lib/content";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "Projetos",
  description: "Todos os projetos de produto de Daniel Oliveira.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <section className={s.section}>
        <div className={`container ${s.inner}`}>
          <SectionLabel>Projetos</SectionLabel>
          <h1 className={s.title}>Todos os projetos</h1>
          <div className={s.grid}>
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} headingLevel="h2" />
            ))}
          </div>
        </div>
      </section>
      <Contact variant="case" />
    </>
  );
}
