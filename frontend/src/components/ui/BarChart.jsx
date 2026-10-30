import { formatMT } from "../../utils/format";

export default function BarChart({ data, height = 220 }) {
  const max = Math.max(...data.map((d) => d.valor), 1);
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex h-full items-end gap-3">
        {data.map((d) => {
          const pct = (d.valor / max) * 100;
          return (
            <div
              key={d.label}
              className="group flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-primary/80 transition hover:bg-primary"
                  style={{ height: `${pct}%` }}
                >
                  <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                    {formatMT(d.valor)}
                  </span>
                </div>
              </div>
              <span className="line-clamp-2 text-center text-[10px] text-text-muted">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}