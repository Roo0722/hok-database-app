'use client';

import type { Hero } from '@/data/heroes';
import { TierBadge } from './tier-badge';
import { StatsBar } from './stats-bar';
import { Star, Shield, Swords, Heart, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroDetailModalProps {
  hero: Hero;
  onClose: () => void;
}

export function HeroDetailModal({ hero, onClose }: HeroDetailModalProps) {
  const stars = Array.from({ length: hero.maxDifficulty }, (_, i) => (
    <Star
      key={i}
      size={16}
      className={i < hero.difficulty ? 'text-[#C2924C] fill-[#C2924C]' : 'text-[#3A3A3A]'}
    />
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1A1A1A] border border-[#C2924C]/20 rounded-xl shadow-2xl gold-glow-strong max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-[#C2924C]/15">
          {/* Decorative corner elements */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#C2924C]/30 rounded-tl-sm" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#C2924C]/30 rounded-tr-sm" />

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-[#F0F0F0]">{hero.name}</h2>
                <TierBadge tier={hero.tier} size="md" />
              </div>
              <p className="text-sm text-[#999999] mb-3">{hero.nameCn}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#2A2A2A] text-[#999999] border border-[#C2924C]/10">
                  <Swords size={10} /> {hero.role}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#2A2A2A] text-[#999999] border border-[#C2924C]/10">
                  <Shield size={10} /> {hero.heroClass}
                </span>
                {hero.subClass && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[#2A2A2A] text-[#808080] border border-[#C2924C]/10">
                    {hero.subClass}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#808080] hover:text-[#F0F0F0] hover:bg-[#2A2A2A] -mt-1 -mr-1"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Difficulty */}
          <div>
            <h3 className="text-xs font-semibold text-[#808080] uppercase tracking-wider mb-2">Difficulty</h3>
            <div className="flex items-center gap-1">
              {stars}
              <span className="ml-2 text-xs text-[#999999]">{hero.difficulty}/{hero.maxDifficulty}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            {hero.verified ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#22C55E]">
                <Zap size={12} /> Verified Stats
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#808080]">
                <Heart size={12} /> Unverified Stats
              </span>
            )}
            {hero.patch && (
              <span className="text-xs text-[#808080]">· Last updated: {hero.patch}</span>
            )}
          </div>

          {/* Base Stats */}
          {hero.stats ? (
            <div>
              <h3 className="text-xs font-semibold text-[#808080] uppercase tracking-wider mb-3">Base Stats</h3>
              <div className="space-y-2.5">
                {hero.stats.hp !== undefined && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Heart size={11} className="text-[#E85D3A]" />
                      <span className="text-xs text-[#999999]">HP</span>
                    </div>
                    <div className="space-y-1">
                      <StatsBar label="Base" value={hero.stats.hp} max={4000} color="#E85D3A" />
                      {hero.stats.hpGrowth && (
                        <StatsBar label="+/lvl" value={hero.stats.hpGrowth} max={300} color="#E85D3A" />
                      )}
                    </div>
                  </div>
                )}
                {hero.stats.attack !== undefined && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Swords size={11} className="text-[#C2924C]" />
                      <span className="text-xs text-[#999999]">Attack</span>
                    </div>
                    <div className="space-y-1">
                      <StatsBar label="Base" value={hero.stats.attack} max={200} color="#C2924C" />
                      {hero.stats.attackGrowth && (
                        <StatsBar label="+/lvl" value={hero.stats.attackGrowth} max={15} color="#C2924C" />
                      )}
                    </div>
                  </div>
                )}
                {hero.stats.defense !== undefined && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Shield size={11} className="text-[#5B8BD4]" />
                      <span className="text-xs text-[#999999]">Defense</span>
                    </div>
                    <div className="space-y-1">
                      <StatsBar label="Base" value={hero.stats.defense} max={150} color="#5B8BD4" />
                      {hero.stats.defenseGrowth && (
                        <StatsBar label="+/lvl" value={hero.stats.defenseGrowth} max={25} color="#5B8BD4" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-[#808080] text-sm">
              Detailed stats not available for this hero yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}