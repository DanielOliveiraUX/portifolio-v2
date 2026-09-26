import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import s from "./FeaturedProject.module.css";

export function FeaturedProject({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <article id={project.slug} className={s.card}>
      <div className={s.media}>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes="(max-width: 899px) 100vw, 45vw"
          className={s.image}
          priority={priority}
        />
      </div>

      <div className={s.body}>
        <div className={s.text}>
          <p className={s.meta}>{project.meta}</p>
          <h3 className={s.title}>{project.title}</h3>
          <p className={s.summary}>{project.summary}</p>
          <ul className={s.bullets}>
            {project.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <Link href={`/projetos/${project.slug}`} className="pill flair-btn">
          <span className="flair" aria-hidden="true" />
          <span className="flair-label">
            Ver projeto completo<span className="sr-only">: {project.title}</span>
          </span>
        </Link>
      </div>
    </article>
  );
}
