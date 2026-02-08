"use client";

interface Theme {
  name: string;
  count: number;
}

interface ImprovementThemesChartProps {
  themes: Theme[];
}

export default function ImprovementThemesChart({ themes }: ImprovementThemesChartProps) {
  if (themes.length === 0) return null;

  const maxCount = Math.max(...themes.map((t) => t.count));

  return (
    <div className="space-y-3">
      {themes.map((theme) => (
        <div key={theme.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">{theme.name}</span>
            <span className="text-muted-foreground text-xs">
              {theme.count} {theme.count === 1 ? "mention" : "mentions"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(theme.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
