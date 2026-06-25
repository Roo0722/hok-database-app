'use client';

import type { Item } from '@/data/items';
import { Coins } from 'lucide-react';

interface ItemCardProps {
  item: Item;
}

const categoryIcons: Record<string, string> = {
  Attack: '⚔️',
  Magic: '🔮',
  Tank: '🛡️',
  Movement: '👢',
  Jungle: '🌿',
  Support: '✨',
  'Attack Equipment': '⚔️',
};

export function ItemCard({ item }: ItemCardProps) {
  const statsEntries = Object.entries(item.stats);
  const keyStats = statsEntries.slice(0, 3);
  const moreCount = statsEntries.length - 3;

  return (
    <div className="hok-card rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base">{categoryIcons[item.category] || '📦'}</span>
            <h3 className="text-sm font-semibold text-[#F0F0F0] truncate">{item.name}</h3>
          </div>
          <p className="text-xs text-[#808080] truncate ml-7">{item.nameCn}</p>
        </div>
        <div className="flex items-center gap-1 text-[#C2924C] shrink-0 ml-2">
          <Coins size={12} />
          <span className="text-sm font-mono font-semibold">{item.price}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#2A2A2A] text-[#999999] border border-[#C2924C]/10">
          {item.category}
        </span>
      </div>

      <div className="space-y-1">
        {keyStats.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="text-[#808080] capitalize">{formatStatKey(key)}</span>
            <span className="text-[#F0F0F0] font-mono">{value}</span>
          </div>
        ))}
        {moreCount > 0 && (
          <div className="text-[10px] text-[#808080] text-center pt-0.5">
            +{moreCount} more stat{moreCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {item.passive && (
        <div className="mt-2 pt-2 border-t border-[#C2924C]/10">
          <p className="text-[11px] text-[#808080] italic leading-relaxed">{item.passive}</p>
        </div>
      )}
    </div>
  );
}

function formatStatKey(key: string): string {
  const map: Record<string, string> = {
    attack: 'ATK',
    magicAttack: 'Magic ATK',
    hp: 'HP',
    armor: 'Armor',
    magicRes: 'Magic Res',
    attackSpeed: 'ATK Speed',
    critRate: 'Crit Rate',
    cdReduction: 'CDR',
    lifesteal: 'Lifesteal',
    movementSpeed: 'Move Speed',
    armorPen: 'Armor Pen',
    magicPen: 'Magic Pen',
    hpRegen: 'HP Regen',
    manaRegen: 'Mana Regen',
    mana: 'Mana',
    goldPer10: 'Gold/10s',
  };
  return map[key] || key;
}