'use client';

import type { PatchNote } from '@/data/patches';
import { Calendar, Users, ChevronRight } from 'lucide-react';

interface PatchCardProps {
  patch: PatchNote;
  expanded?: boolean;
  onToggle?: () => void;
}

const categoryStyles: Record<string, string> = {
  'Major Update': 'bg-[#C2924C]/20 text-[#E7C285] border-[#C2924C]/30',
  'Server Update': 'bg-[#5B8BD4]/20 text-[#89B4E8] border-[#5B8BD4]/30',
  'Balance Update': 'bg-[#E85D3A]/20 text-[#F09880] border-[#E85D3A]/30',
  'Bug Fix': 'bg-[#22C55E]/20 text-[#4ADE80] border-[#22C55E]/30',
};

export function PatchCard({ patch, expanded, onToggle }: PatchCardProps) {
  const formattedDate = new Date(patch.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="hok-card rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 cursor-pointer flex items-start gap-4"
      >
        <div className="shrink-0 text-center">
          <span className="text-lg font-bold text-[#C2924C]">{patch.version}</span>
          {patch.season && (
            <p className="text-[10px] text-[#808080] mt-0.5 max-w-[100px] truncate">{patch.season}</p>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded border ${categoryStyles[patch.category] || 'bg-[#2A2A2A] text-[#999999]'}`}>
              {patch.category}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#808080]">
              <Calendar size={10} />
              {formattedDate}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[#F0F0F0] mb-1">{patch.title}</h3>
          <p className="text-xs text-[#999999] line-clamp-2 leading-relaxed">{patch.changes}</p>

          {patch.heroChanges && patch.heroChanges.length > 0 && !expanded && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-[#808080]">
              <Users size={10} />
              <span>{patch.heroChanges.length} hero change{patch.heroChanges.length > 1 ? 's' : ''}</span>
              <ChevronRight size={10} className="ml-1" />
            </div>
          )}
        </div>

        {onToggle && (
          <ChevronRight
            size={16}
            className={`shrink-0 text-[#808080] mt-2 transition-transform duration-200 ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        )}
      </button>

      {expanded && patch.heroChanges && patch.heroChanges.length > 0 && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-[#C2924C]/10 pt-3">
            <div className="flex items-center gap-1 mb-2">
              <Users size={12} className="text-[#C2924C]" />
              <span className="text-xs font-semibold text-[#999999]">Affected Heroes</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patch.heroChanges.map((change, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded bg-[#2A2A2A] text-[#F0F0F0] border border-[#C2924C]/10"
                >
                  {change}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}