'use client';

import type { Hero } from '@/data/heroes';
import { TierBadge } from './tier-badge';
import { Star } from 'lucide-react';

interface HeroCardProps {
  hero: Hero;
  onClick: (hero: Hero) => void;
}

export function HeroCard({ hero, onClick }: HeroCardProps) {
  const stars = Array.from({ length: hero.maxDifficulty }, (_, i) => (
    <Star
      key={i}
      size={12}
      className={i < hero.difficulty ? 'text-[#C2924C] fill-[#C2924C]' : 'text-[#3A3A3A]'}
    />
  ));

  return (
    <button
      onClick={() => onClick(hero)}
      className="hok-card rounded-lg p-4 text-left w-full cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#F0F0F0] truncate group-hover:text-[#E7C285] transition-colors">
            {hero.name}
          </h3>
          <p className="text-xs text-[#808080] truncate">{hero.nameCn}</p>
        </div>
        <TierBadge tier={hero.tier} size="sm" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#999999]">{hero.role}</span>
          <span className="text-[#3A3A3A]">·</span>
          <span className="text-xs text-[#999999]">{hero.heroClass}</span>
          {hero.subClass && (
            <>
              <span className="text-[#3A3A3A]">·</span>
              <span className="text-xs text-[#808080]">{hero.subClass}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-0.5">{stars}</div>
      </div>

      {!hero.verified && (
        <div className="mt-2">
          <span className="text-[10px] text-[#808080] italic">Unverified stats</span>
        </div>
      )}
    </button>
  );
}