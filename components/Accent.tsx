/** Heading text followed by highlighted words, both edited in the admin panel. */
export default function Accent({ title, accent }: { title: string; accent?: string }) {
  return (
    <>
      {title}
      {accent ? (
        <>
          {title ? " " : ""}
          <span className="text-amber-700">{accent}</span>
        </>
      ) : null}
    </>
  );
}

/** A heading with nothing filled in is skipped entirely. */
export const hasText = (h: { eyebrow?: string; title?: string; accent?: string; description?: string }) =>
  Boolean(h.title || h.accent || h.eyebrow || h.description);
