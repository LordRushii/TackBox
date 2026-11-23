/** A 3x3 tile loader. One tile lights up at a time, walking the ring like a cursor. */
const RING = [0, 1, 2, 5, 8, 7, 6, 3];

export default function PixelLoader({ label }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }, (_, i) => {
          const step = RING.indexOf(i);
          return (
            <span
              key={i}
              className={`size-2.5 rounded-[2px] border border-line-strong ${step === -1 ? "bg-card" : "pixel-loader bg-card"}`}
              style={step === -1 ? undefined : { animationDelay: `${step * 120}ms` }}
            />
          );
        })}
      </div>
      {label && <p className="text-sm text-subtle">{label}</p>}
    </div>
  );
}
