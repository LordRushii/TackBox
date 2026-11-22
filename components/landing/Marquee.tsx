import { FileText } from "lucide-react";

/** An endless strip of skill names. The list is rendered twice so the loop has no seam. */
export default function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-3 pr-3 animate-marquee">
      {items.map((name) => (
        <li
          key={name}
          className="flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-line bg-card/70 px-3.5 font-mono text-[12.5px] text-subtle"
        >
          <FileText className="size-3.5 text-muted" strokeWidth={1.5} />
          {name}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      {row(false)}
      {row(true)}
    </div>
  );
}
