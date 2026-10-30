import { useId } from "react";
import { formatMT } from "../../utils/format";

export default function LineChart({ data, height = 220 }) {
  const gradientId = useId();
  const W = 600;
  const H = height;
  const pad = { top: 16, right: 12, bottom: 28, left: 12 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const max = Math.max(...data.map((d) => d.valor), 1);
  const min = 0;

  const points = data.map((d, i) => {
    const x = pad.left + (i / (data.length - 1 || 1)) * innerW;
    const y = pad.top + innerH - ((d.valor - min) / (max - min)) * innerH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(
    1
  )} ${pad.top + innerH} L ${points[0].x.toFixed(1)} ${pad.top + innerH} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d9488" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Linhas horizontais guia */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={pad.left}
          x2={W - pad.right}
          y1={pad.top + innerH * t}
          y2={pad.top + innerH * t}
          stroke="#e2e8f0"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="#0d9488"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {points.map((p) => (
        <g key={p.dia}>
          <circle cx={p.x} cy={p.y} r="3" fill="#0d9488" />
          <title>{`${p.dia} — ${formatMT(p.valor)}`}</title>
        </g>
      ))}

      {points.map((p, i) => {
        if (i % 2 !== 0 && i !== points.length - 1) return null;
        return (
          <text
            key={`lbl-${p.dia}`}
            x={p.x}
            y={H - 8}
            textAnchor="middle"
            className="fill-slate-500"
            style={{ fontSize: 10 }}
          >
            {p.dia}
          </text>
        );
      })}
    </svg>
  );
}