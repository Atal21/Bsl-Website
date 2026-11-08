import Reveal from "./Reveal";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
};

export default function SectionHeading({ eyebrow, title, description, align = "left" }: Props) {
  const center = align === "center";
  return (
    <Reveal className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="font-display-tight mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">{title}</h2>
      {description && <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>}
    </Reveal>
  );
}
