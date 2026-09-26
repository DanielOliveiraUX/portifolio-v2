import Image from "next/image";
import { DanielMark, OliveiraMark } from "@/components/NameMark";
import { SectionLabel } from "@/components/SectionLabel";
import { FeaturedProject } from "@/components/FeaturedProject";
import { ProjectTabs, AllProjectsLink } from "@/components/ProjectTabs";
import { Contact } from "@/components/Contact";
import { featuredProjects } from "@/data/projects";
import { AboutText } from "@/components/AboutText";
import { HeroScroll } from "@/components/HeroScroll";
import { bio, bioImage, heroImage, site } from "@/data/site";
import s from "./page.module.css";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <HeroScroll
        className={s.hero}
        bgClassName={s.heroBg}
        contentClassName={`container ${s.heroInner}`}
        background={<Image src={heroImage.src} alt="" fill priority sizes="100vw" className={s.heroImg} />}
      >
        <h1 className={s.name}>
          <span className="sr-only">Daniel Oliveira</span>
          <DanielMark className={s.daniel} />
          <OliveiraMark className={s.oliveira} />
        </h1>
        <div className={s.subline}>
          <p className={s.role}>{site.role}</p>
          <p className={s.location}>{site.location}</p>
        </div>
      </HeroScroll>

      {/* Seção verde */}
      <section className={s.about} aria-label="Como eu trabalho">
        <AboutText className={`container ${s.aboutInner}`} lineClassName={s.aboutLine} />
      </section>

      {/* Projetos selecionados */}
      <section id="trabalhos" className={s.projects} aria-labelledby="trabalhos-titulo">
        <div className={`container ${s.projectsInner}`}>
          <div className={s.toolbar}>
            <SectionLabel as="h2">
              <span id="trabalhos-titulo">Projetos</span>
            </SectionLabel>
            <ProjectTabs items={featuredProjects.map(({ slug, tab }) => ({ slug, tab }))} />
            <div className={s.allDesktop}>
              <AllProjectsLink />
            </div>
          </div>

          {featuredProjects.map((p, i) => (
            <FeaturedProject key={p.slug} project={p} priority={i === 0} />
          ))}

          <div className={s.allMobile}>
            <AllProjectsLink />
          </div>
        </div>
      </section>

      {/* Sobre mim */}
      <section id="sobre" className={s.bio} aria-labelledby="sobre-titulo">
        <div className={`container ${s.bioInner}`}>
          <SectionLabel as="h2">
            <span id="sobre-titulo">Sobre mim</span>
          </SectionLabel>

          <div className={s.bioRow}>
            <div className={s.bioName} aria-hidden="true">
              <DanielMark className={s.bioDaniel} />
              <OliveiraMark className={s.bioOliveira} />
            </div>
            <div className={s.bioMedia}>
              <Image src={bioImage.src} alt={bioImage.alt} fill sizes="(max-width: 699px) 100vw, 464px" className={s.bioImage} />
            </div>
            <div className={s.bioText}>
              {bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}
