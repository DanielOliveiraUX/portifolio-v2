import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CaseIndex } from "@/components/CaseIndex";
import { SectionLabel } from "@/components/SectionLabel";
import { ProjectCard } from "@/components/ProjectCard";
import { Contact } from "@/components/Contact";
import { ReadingProgress } from "@/components/ReadingProgress";
import { CaseEditor } from "@/components/admin/CaseEditor";
import { getCaseData, getOtherProjects, getProject, getProjects } from "@/lib/content";
import s from "./page.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

// Artigos criados pelo editor aparecem sem precisar de um novo deploy.
export const dynamicParams = true;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const [project, data] = await Promise.all([getProject(slug), getCaseData(slug)]);
  if (!project || !data) notFound();

  const [hero, ...rest] = project.gallery;
  const others = await getOtherProjects(project.slug);

  return (
    <>
      <ReadingProgress key={project.slug} />

      {/* Título + galeria */}
      <section className={s.top}>
        <div className={`container ${s.topInner}`}>
          <h1 className={s.pageTitle} data-edit="title">
            {project.title}
          </h1>
          <div className={s.gallery}>
            {hero && (
              <div className={`${s.shot} ${s.shotWide}`} data-edit-image="gallery.0">
                <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className={s.img} />
              </div>
            )}
            {rest.length > 0 && (
              <div className={s.pair}>
                {rest.map((img, i) => (
                  <div key={i} className={`${s.shot} ${s.shotHalf}`} data-edit-image={`gallery.${i + 1}`}>
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
              <p className={s.meta} data-edit="meta">
                {project.meta}
              </p>
              <h2 className={s.introTitle} data-edit-mirror="title">
                {project.title}
              </h2>
              <p className={s.summary} data-edit="summary">
                {project.summary}
              </p>
            </div>
            <p className={s.introText} data-edit="intro">
              {project.intro}
            </p>
          </div>

          {/* vaga do painel "tópicos do card", usado só no modo edição */}
          <div className={s.imageSlot} data-edit-card-slot />

          <hr className={s.divider} />

          <div className={s.body}>
            <CaseIndex items={project.sections.map(({ id, title }) => ({ id, title }))} />
            <div className={s.sections}>
              {project.sections.map((sec, si) => (
                <div key={sec.id} className={s.sectionGroup}>
                  <div className={s.imageSlot} data-edit-section-slot={si} />
                  <section id={sec.id} className={s.block} aria-labelledby={`${sec.id}-titulo`}>
                    <h3 id={`${sec.id}-titulo`} className={s.blockTitle} data-edit={`sections.${si}.title`}>
                      {sec.title}
                    </h3>
                    <div className={s.blockText}>
                      {sec.paragraphs.map((para, i) => (
                        <p key={i} data-edit={`sections.${si}.paragraphs.${i}`}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </section>
                  <div className={s.imageSlot} data-edit-image-slot={`sections.${si}`}>
                    {sec.image && (
                      <div className={`${s.shot} ${s.shotBody}`} data-edit-image={`sections.${si}`}>
                        <Image src={sec.image.src} alt={sec.image.alt} fill sizes="(max-width: 899px) 100vw, 712px" className={s.img} />
                      </div>
                    )}
                  </div>
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

      <CaseEditor initial={data} />
    </>
  );
}
