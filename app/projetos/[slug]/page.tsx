import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CaseIndex } from "@/components/CaseIndex";
import { SectionLabel } from "@/components/SectionLabel";
import { ProjectCard } from "@/components/ProjectCard";
import { Contact } from "@/components/Contact";
import { ReadingProgress } from "@/components/ReadingProgress";
import { getOtherProjects, getProject, projects } from "@/data/projects";
import s from "./page.module.css";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const [hero, ...rest] = project.gallery;
  const others = getOtherProjects(project.slug);

  return (
    <>
      <ReadingProgress key={project.slug} />

      {/* Título + galeria */}
      <section className={s.top}>
        <div className={`container ${s.topInner}`}>
          <h1 className={s.pageTitle}>{project.title}</h1>
          <div className={s.gallery}>
            {hero && (
              <div className={`${s.shot} ${s.shotWide}`}>
                <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className={s.img} />
              </div>
            )}
            {rest.length > 0 && (
              <div className={s.pair}>
                {rest.map((img, i) => (
                  <div key={i} className={`${s.shot} ${s.shotHalf}`}>
                    <Image src={img.src} alt={img.alt} fill sizes="(max-width: 767px) 100vw, 50vw" className={s.img} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Intro + corpo */}
      <section className={s.content}>
        <div className={`container ${s.contentInner}`}>
          <div className={s.intro}>
            <div className={s.introLead}>
              <p className={s.meta}>{project.meta}</p>
              <h2 className={s.introTitle}>{project.title}</h2>
              <p className={s.summary}>{project.summary}</p>
            </div>
            <p className={s.introText}>{project.intro}</p>
          </div>

          <hr className={s.divider} />

          <div className={s.body}>
            <CaseIndex items={project.sections.map(({ id, title }) => ({ id, title }))} />
            <div className={s.sections}>
              {project.sections.map((sec) => (
                <div key={sec.id} className={s.sectionGroup}>
                  <section id={sec.id} className={s.block} aria-labelledby={`${sec.id}-titulo`}>
                    <h3 id={`${sec.id}-titulo`} className={s.blockTitle}>
                      {sec.title}
                    </h3>
                    <div className={s.blockText}>
                      {sec.paragraphs.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </section>
                  {sec.image && (
                    <div className={`${s.shot} ${s.shotBody}`}>
                      <Image src={sec.image.src} alt={sec.image.alt} fill sizes="(max-width: 899px) 100vw, 712px" className={s.img} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Outros projetos */}
      {others.length > 0 && (
        <section className={s.others} aria-labelledby="outros-titulo">
          <div className={`container ${s.othersInner}`}>
            <SectionLabel as="h2">
              <span id="outros-titulo">Outros projetos</span>
            </SectionLabel>
            <div className={s.othersGrid}>
              {others.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Contact variant="case" />
    </>
  );
}
