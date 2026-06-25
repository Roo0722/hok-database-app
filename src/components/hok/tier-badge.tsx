'use client';

import { Badge } from '@/components/ui/badge';
import type { Tier } from '@/data/heroes';

const tierColors: Record<Tier, string> = {
  S: 'bg-[#C2924C]/20 text-[#E7C285] border-[#C2924C]/40',
  A: 'bg-[#E85D3A]/20 text-[#F09880] border-[#E85D3A]/40',
  B: 'bg-[#5B8BD4]/20 text-[#89B4E8] border-[#5B8BD4]/40',
  C: 'bg-[#6B7280]/20 text-[#9CA3AF] border-[#6B7280]/40',
};

const tierDotColors: Record<Tier, string> = {
  S: 'bg-[#C2924C]',
  A: 'bg-[#E85D3A]',
  B: 'bg-[#5B8BD4]',
  C: 'bg-[#6B7280]',
};

interface TierBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export function TierBadge({ tier, size = 'md', showDot = true }: TierBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      variant="outline"
      className={`${tierColors[tier]} ${sizeClasses[size]} font-bold tracking-wider border hover:${tierColors[tier]} transition-colors`}
    >
      {showDot && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${tierDotColors[tier]} mr-1.5`} />
      )}
      {tier}
    </Badge>
  );
}