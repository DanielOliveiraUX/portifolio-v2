import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import s from "./ProjectCard.module.css";

export function ProjectCard({ project, headingLevel = "h3" }: { project: Project; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className={s.card}>
      <div className={s.media}>
        <Image src={project.cover.src} alt={project.cover.alt} fill sizes="(max-width: 559px) 100vw, 283px" className={s.image} />
      </div>
      <div className={s.body}>
        <div className={s.text} data-velocity-blur>
          <p className={s.meta}>{project.meta}</p>
          <Heading className={s.title}>{project.title}</Heading>
          <p className={s.summary}>{project.summary}</p>
        </div>
        <Link href={`/projetos/${project.slug}`} className="pill">
          Ver projeto completo<span className="sr-only">: {project.title}</span>
        </Link>
      </div>
    </article>
  );
}
