'use client';

import { Calendar, ExternalLink, Newspaper } from 'lucide-react';

export interface NewsArticle {
  title: string;
  date: string;
  category: string;
  description: string;
  thumbnail?: string;
  url?: string;
}

interface NewsCardProps {
  article: NewsArticle;
}

const categoryColors: Record<string, string> = {
  'Patch Notes': 'bg-[#C2924C]/20 text-[#E7C285] border-[#C2924C]/30',
  'Update': 'bg-[#5B8BD4]/20 text-[#89B4E8] border-[#5B8BD4]/30',
  'Event': 'bg-[#A855F7]/20 text-[#C084FC] border-[#A855F7]/30',
  'Esports': 'bg-[#E85D3A]/20 text-[#F09880] border-[#E85D3A]/30',
  'Hero': 'bg-[#22C55E]/20 text-[#4ADE80] border-[#22C55E]/30',
};

export function NewsCard({ article }: NewsCardProps) {
  const formattedDate = article.date
    ? new Date(article.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const catKey = Object.keys(categoryColors).find(
    (k) => article.category?.toLowerCase().includes(k.toLowerCase())
  );
  const catStyle = catKey ? categoryColors[catKey] : 'bg-[#2A2A2A] text-[#999999] border-[#C2924C]/10';

  return (
    <a
      href={article.url || '#'}
      target={article.url ? '_blank' : undefined}
      rel={article.url ? 'noopener noreferrer' : undefined}
      className="hok-card rounded-lg overflow-hidden block group"
    >
      {article.thumbnail && (
        <div className="relative h-40 bg-[#2A2A2A] overflow-hidden">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent" />
          {article.category && (
            <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded border ${catStyle}`}>
              {article.category}
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        {!article.thumbnail && article.category && (
          <span className={`inline-block text-[10px] px-2 py-0.5 rounded border mb-2 ${catStyle}`}>
            {article.category}
          </span>
        )}

        <h3 className="text-sm font-semibold text-[#F0F0F0] mb-1.5 line-clamp-2 group-hover:text-[#E7C285] transition-colors leading-snug">
          {article.title}
        </h3>

        {article.description && (
          <p className="text-xs text-[#808080] line-clamp-2 mb-2 leading-relaxed">
            {article.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-[#808080]">
            <Calendar size={10} />
            {formattedDate}
          </span>
          {article.url && (
            <span className="flex items-center gap-1 text-[10px] text-[#C2924C] opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink size={10} />
              Read more
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="hok-card rounded-lg overflow-hidden animate-pulse">
      <div className="h-40 bg-[#2A2A2A]" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-[#2A2A2A] rounded w-16" />
        <div className="h-4 bg-[#2A2A2A] rounded w-full" />
        <div className="h-4 bg-[#2A2A2A] rounded w-3/4" />
        <div className="h-3 bg-[#2A2A2A] rounded w-24" />
      </div>
    </div>
  );
}

export function NewsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Newspaper size={48} className="text-[#3A3A3A] mb-4" />
      <h3 className="text-sm font-semibold text-[#808080] mb-1">No News Available</h3>
      <p className="text-xs text-[#808080] max-w-xs">
        Unable to fetch news from the official website. Try clicking the refresh button to re-scrape.
      </p>
    </div>
  );
}