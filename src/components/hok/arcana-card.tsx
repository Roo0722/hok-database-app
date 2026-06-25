'use client';

import type { Arcana, ArcanaColor } from '@/data/arcana';

interface ArcanaCardProps {
  arcana: Arcana;
}

const colorConfig: Record<ArcanaColor, { bg: string; text: string; border: string; dot: string; glow: string }> = {
  Red: {
    bg: 'bg-[#E85D3A]/10',
    text: 'text-[#F09880]',
    border: 'border-[#E85D3A]/30',
    dot: 'bg-[#E85D3A]',
    glow: 'shadow-[0_0_8px_rgba(232,93,58,0.15)]',
  },
  Purple: {
    bg: 'bg-[#A855F7]/10',
    text: 'text-[#C084FC]',
    border: 'border-[#A855F7]/30',
    dot: 'bg-[#A855F7]',
    glow: 'shadow-[0_0_8px_rgba(168,85,247,0.15)]',
  },
  Blue: {
    bg: 'bg-[#5B8BD4]/10',
    text: 'text-[#89B4E8]',
    border: 'border-[#5B8BD4]/30',
    dot: 'bg-[#5B8BD4]',
    glow: 'shadow-[0_0_8px_rgba(91,139,212,0.15)]',
  },
  Green: {
    bg: 'bg-[#22C55E]/10',
    text: 'text-[#4ADE80]',
    border: 'border-[#22C55E]/30',
    dot: 'bg-[#22C55E]',
    glow: 'shadow-[0_0_8px_rgba(34,197,94,0.15)]',
  },
};

export function ArcanaCard({ arcana }: ArcanaCardProps) {
  const config = colorConfig[arcana.color];
  const statsEntries = Object.entries(arcana.stats);

  return (
    <div className={`hok-card rounded-lg p-4 ${config.glow}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${config.dot}`} />
            <h3 className="text-sm font-semibold text-[#F0F0F0] truncate">{arcana.name}</h3>
          </div>
          <p className="text-xs text-[#808080] truncate ml-[18px]">{arcana.nameCn}</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded border ${config.bg} ${config.text} ${config.border}`}>
          {arcana.color}
        </span>
      </div>

      <div className="space-y-1.5">
        {statsEntries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="text-[#808080]">{formatArcanaStat(key)}</span>
            <span className={`${config.text} font-mono font-medium`}>
              +{value}{getStatUnit(key)}
            </span>
          </div>
        ))}
      </div>

      {arcana.bonus && (
        <div className="mt-2 pt-2 border-t border-[#C2924C]/10">
          <p className="text-[11px] text-[#808080] italic">{arcana.bonus}</p>
        </div>
      )}
    </div>
  );
}

function formatArcanaStat(key: string): string {
  const map: Record<string, string> = {
    attack: 'Attack',
    attackSpeed: 'Attack Speed',
    critRate: 'Crit Rate',
    movementSpeed: 'Move Speed',
    hp: 'Max HP',
    armorPen: 'Armor Pen',
    cdReduction: 'CDR',
    magicAttack: 'Magic ATK',
    magicPen: 'Magic Pen',
    lifesteal: 'Lifesteal',
    goldPer10: 'Gold/10s',
    magicRes: 'Magic Res',
    hpRegen: 'HP Regen',
    armor: 'Armor',
  };
  return map[key] || key;
}

function getStatUnit(key: string): string {
  if (key === 'attackSpeed' || key === 'critRate' || key === 'cdReduction') return '%';
  if (key === 'movementSpeed') return '%';
  if (key === 'hpRegen') return '/5s';
  if (key === 'lifesteal') return '%';
  return '';
}