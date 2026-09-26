// Conteúdo provisório vindo do Figma. Para atualizar um projeto, edite só este arquivo.
// Imagens: coloque os arquivos em /public/images e troque os caminhos abaixo.

export type CaseSection = {
  id: string;
  title: string;
  paragraphs: string[];
  image?: { src: string; alt: string };
};

export type Project = {
  slug: string;
  tab: string;
  meta: string;
  title: string;
  summary: string;
  bullets: string[];
  cover: { src: string; alt: string };
  gallery: { src: string; alt: string }[];
  intro: string;
  sections: CaseSection[];
  featured: boolean;
};

const placeholder = { src: "/images/placeholder.jpg", alt: "" };

const lorem =
  "Senior UX/UI Designer, in-house. Full ownership of designer experience, Figma kit architecture, component design, documentation, and long-term governance.";

const sections = (): CaseSection[] => [
  { id: "visao-geral", title: "Visão geral", paragraphs: [`${lorem} ${lorem} ${lorem}`, `${lorem} ${lorem}`] },
  { id: "contexto-do-negocio", title: "Contexto do negócio", paragraphs: [`${lorem} ${lorem} ${lorem}`, `${lorem} ${lorem}`], image: placeholder },
  { id: "pesquisa-e-descoberta", title: "Pesquisa e descoberta", paragraphs: [`${lorem} ${lorem} ${lorem}`, `${lorem} ${lorem}`] },
  { id: "decisoes-chave", title: "Decisões-chave", paragraphs: [`${lorem} ${lorem} ${lorem}`, `${lorem} ${lorem}`] },
  { id: "o-que-foi-entregue", title: "O que foi entregue", paragraphs: [`${lorem} ${lorem} ${lorem}`, `${lorem} ${lorem}`] },
];

const base = {
  meta: "France · Global · 2024–2026",
  title: "Veepee · Design System Lead",
  summary: "Scaling a multi-brand e-commerce ecosystem through governance, systems, and AI-assisted workflows.",
  bullets: [
    "Led Design System governance across multiple product and dev teams",
    "Reduced design-to-dev friction through good documentation and UX practices",
    "Facilitated stakeholder alignment in complex, multi-team environments",
  ],
  cover: placeholder,
  gallery: [placeholder, placeholder, placeholder],
  intro: `${lorem} ${lorem} ${lorem}`,
};

const concessionariasCover = {
  src: "/images/concessionarias-dashboard.png",
  alt: "Dashboard da plataforma para concessionárias com indicadores de veículos, ações rápidas e gráfico de desempenho",
};

const concessionarias: Project = {
  slug: "concessionarias",
  tab: "Projeto 01",
  meta: "Setor automotivo · Produto B2B",
  title: "Concessionárias · Plataforma de gestão integrada",
  summary: "Uma plataforma única para tirar as concessionárias do vaivém entre sistemas e devolver tempo para vender.",
  bullets: [
    "Mapeei a jornada da concessionária, do cadastro do veículo ao atendimento, e transformei as dores em escopo priorizado",
    "Defini um produto modular sobre a infraestrutura existente, reduzindo custo de licenças e dependência de fornecedores",
    "Entreguei um produto validado com usuários e com custo de implementação estimado, base para precificação e lançamento",
  ],
  cover: concessionariasCover,
  gallery: [concessionariasCover, placeholder, placeholder],
  intro:
    "Concessionárias trabalham com equipes de alta rotatividade e pouco tempo sobrando. Mesmo assim, tarefas básicas como cadastrar um carro ou atualizar um anúncio dependiam de vários sistemas, cada um com seu login e sua curva de aprendizado. Como PM, meu trabalho foi transformar essa fragmentação numa tese de produto: uma plataforma única, viável para a empresa construir e simples o bastante para qualquer colaborador adotar.",
  sections: [
    {
      id: "visao-geral",
      title: "Visão geral",
      paragraphs: [
        "O problema não era falta de ferramenta, era excesso. Cada etapa da operação (estoque, anúncios em portais, atendimento ao cliente) vivia num sistema diferente, e nenhum conversava com o outro. O resultado era retrabalho diário: o mesmo anúncio atualizado à mão em vários portais, dados do veículo digitados mais de uma vez e clientes esperando resposta.",
        "Para o negócio, a oportunidade era clara. Centralizar essas tarefas num só produto reduz o custo operacional da concessionária e cria para a empresa um produto com potencial de receita recorrente no setor automotivo.",
      ],
    },
    {
      id: "contexto-do-negocio",
      title: "Contexto do negócio",
      paragraphs: [
        "O problema apareceu em conversas e visitas técnicas às concessionárias. O padrão se repetia: vários logins, conhecimento espalhado entre sistemas e muito tempo gasto em ações repetitivas. A rotatividade das equipes piorava tudo, porque cada pessoa nova precisava aprender várias ferramentas ao mesmo tempo.",
        "Isso definiu duas restrições desde o início. O produto precisava ser mais simples do que o conjunto de ferramentas que ia substituir, senão ninguém trocaria. E precisava ser barato de operar, porque integrações e armazenamento seriam os maiores custos recorrentes.",
      ],
    },
    {
      id: "pesquisa-e-descoberta",
      title: "Pesquisa e descoberta",
      paragraphs: [
        "Comecei mapeando a jornada completa, do cadastro do veículo ao atendimento do cliente. Com entrevistas e observação do trabalho real, identifiquei onde estavam as fricções, quais tarefas se repetiam e quais sistemas não trocavam dados entre si.",
        "Esse mapa virou a base da priorização. Em vez de uma lista de funcionalidades pedidas, o time passou a ter um retrato de onde o tempo da equipe estava sendo perdido, e foi isso que orientou o que entraria primeiro no produto.",
      ],
    },
    {
      id: "decisoes-chave",
      title: "Decisões-chave",
      paragraphs: [
        "Priorizei quatro frentes que atacavam as maiores perdas de tempo: cadastro de veículos com preenchimento otimizado, consulta automática a bases públicas de dados veiculares e restrições, um hub para editar e publicar anúncios em vários portais de uma vez e um agente virtual para fazer o primeiro contato e os agendamentos com clientes.",
        "Optei por uma arquitetura modular sobre a infraestrutura que a empresa já usava. Isso reduziu o custo com licenças, evitou dependência de vários fornecedores e permitiu que as concessionárias adotassem o produto aos poucos.",
        "Integrações com APIs pagas e armazenamento de imagens foram tratados como decisões de negócio, não só técnicas. Cada uma foi planejada para equilibrar desempenho e custo, para que o produto continuasse competitivo sem comprometer a margem.",
      ],
    },
    {
      id: "o-que-foi-entregue",
      title: "O que foi entregue",
      paragraphs: [
        "O projeto chegou a um produto com escopo bem definido, validado em testes de usabilidade com usuários reais e pronto para desenvolvimento. Os fluxos foram pensados para que colaboradores com pouca familiaridade digital executassem as tarefas sem treinamento longo, e os processos ficaram documentados para suporte e onboarding.",
        "Com a necessidade e o mercado bem entendidos, foi possível estimar com precisão o custo de implementação. Isso deu à empresa uma base concreta para precificar o produto e definir a estratégia de lançamento.",
      ],
    },
    {
      id: "aprendizados",
      title: "Aprendizados",
      paragraphs: [
        "Em operações com muitas dores ao mesmo tempo, centralizar e simplificar gera mais valor percebido do que adicionar funcionalidades. E o custo de infraestrutura precisa entrar na conversa desde o começo, porque é ele que decide se o produto se sustenta.",
        "Trabalhar perto do time de desenvolvimento desde cedo manteve as decisões de produto compatíveis com a realidade técnica e evitou retrabalho na hora de construir.",
      ],
    },
  ],
  featured: true,
};

export const projects: Project[] = [
  concessionarias,
  { ...base, slug: "projeto-02", tab: "Projeto 02", sections: sections(), featured: true },
  { ...base, slug: "projeto-03", tab: "Projeto 03", sections: sections(), featured: true },
];

export const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getOtherProjects(slug: string, count = 2) {
  return projects.filter((p) => p.slug !== slug).slice(0, count);
}
