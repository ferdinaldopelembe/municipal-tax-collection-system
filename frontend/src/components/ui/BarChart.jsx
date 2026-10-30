import { formatMT } from "../../utils/format";

export default function BarChart({ data, height = 240 }) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-text-muted"
        style={{ height }}
      >
        Sem dados
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.valor), 1);
  
  // Reservamos 30px para a legenda em baixo, o resto é para as barras
  const chartHeight = height - 30; 

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex h-full items-end gap-2">
        {data.map((d) => {
          // Calcula a altura exacta em pixels
          const barHeight = Math.max((d.valor / max) * chartHeight, 4); 
          
          return (
            <div
              key={d.label}
              className="group flex flex-1 flex-col items-center justify-end h-full"
            >
              <div className="relative flex w-full items-end justify-center">
                <div
                  className="w-full max-w-[48px] rounded-t-md bg-primary/80 transition-all duration-300 hover:bg-primary"
                  style={{ height: `${barHeight}px` }}
                >
                  {/* Tooltip */}
                  <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-[10px] font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                    {formatMT(d.valor)}
                  </span>
                </div>
              </div>
              
              {/* Label do mercado */}
              <span className="mt-2 line-clamp-1 text-center text-[10px] text-text-muted">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}