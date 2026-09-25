import s from "./SectionLabel.module.css";

export function SectionLabel({ children, as: Tag = "p" }: { children: React.ReactNode; as?: "p" | "h2" }) {
  return (
    <Tag className={s.label}>
      <span className={s.line} aria-hidden="true" />
      {children}
    </Tag>
  );
}
