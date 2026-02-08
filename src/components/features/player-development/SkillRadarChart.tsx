"use client";

interface SkillRadarChartProps {
  trends: { skill: string; currentLevel?: number }[];
  size?: number;
}

const SKILLS = ["Serve", "Attack", "Defense", "Setting", "Blocking"];
const MAX_LEVEL = 10;

export default function SkillRadarChart({ trends, size = 200 }: SkillRadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.8;
  const angleStep = (2 * Math.PI) / SKILLS.length;
  const startAngle = -Math.PI / 2; // Start from top

  // Map skill names to values (0-10)
  const values = SKILLS.map((skill) => {
    const trend = trends.find(
      (t) => t.skill.toLowerCase() === skill.toLowerCase()
    );
    return trend?.currentLevel ?? 0;
  });

  // Calculate point position on the radar
  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / MAX_LEVEL) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate grid rings (at 25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Generate grid polygon points for a ring
  const ringPoints = (scale: number) =>
    SKILLS.map((_, i) => {
      const p = getPoint(i, MAX_LEVEL * scale);
      return `${p.x},${p.y}`;
    }).join(" ");

  // Data polygon points
  const dataPoints = values.map((v, i) => {
    const p = getPoint(i, v);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map((scale) => (
          <polygon
            key={scale}
            points={ringPoints(scale)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
            opacity={0.3}
          />
        ))}

        {/* Axis lines */}
        {SKILLS.map((_, i) => {
          const p = getPoint(i, MAX_LEVEL);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
              opacity={0.2}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill="rgba(255, 125, 0, 0.15)"
          stroke="#FF7D00"
          strokeWidth="2"
        />

        {/* Data points (dots) */}
        {values.map((v, i) => {
          const p = getPoint(i, v);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#FF7D00"
              stroke="#fff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Labels */}
        {SKILLS.map((skill, i) => {
          const labelRadius = radius + 18;
          const angle = startAngle + i * angleStep;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          const value = values[i];

          return (
            <text
              key={skill}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground text-[10px] font-medium"
            >
              {skill} ({value.toFixed(1)})
            </text>
          );
        })}
      </svg>
    </div>
  );
}
