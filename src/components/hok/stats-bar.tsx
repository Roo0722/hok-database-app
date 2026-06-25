'use client';

interface StatsBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export function StatsBar({ label, value, max, color = '#C2924C' }: StatsBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#999999] w-8 shrink-0 text-right font-mono">{label}</span>
      <div className="flex-1 h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
      <span className="text-xs text-[#F0F0F0] w-12 shrink-0 font-mono tabular-nums">
        {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
      </span>
    </div>
  );
}