'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  heroes, allRoles, allClasses, allTiers,
  type Hero, type Tier, type Role, type HeroClass,
  type HeroBuild, type HeroSkill, type HeroRate,
} from '@/data/heroes';
import { items, allCategories, type Item } from '@/data/items';
import { arcana, allArcanaColors, type Arcana, type ArcanaColor } from '@/data/arcana';
import { patches, type PatchNote, type PatchChange } from '@/data/patches';

// ─── Types ────────────────────────────────────────────────────────────
type TabType = 'heroes' | 'items' | 'arcana' | 'patches' | 'news';

interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  imageUrl?: string;
  link?: string;
  isPatch: boolean;
}

// ─── Helper Components ───────────────────────────────────────────────

function TierBadge({ tier, size = 'md' }: { tier: Tier; size?: 'sm' | 'md' }) {
  const cls =
    tier === 'S' ? 'tier-s' :
    tier === 'A' ? 'tier-a' :
    tier === 'B' ? 'tier-b' : 'tier-c';
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';

  return (
    <span className={`${cls} ${sizeClass} inline-flex items-center justify-center rounded font-bold shrink-0`}>
      {tier}
    </span>
  );
}

function DifficultyStars({ current, max = 3 }: { current: number; max?: number }) {
  return (
    <div className="flex gap-0.5" title={`Difficulty: ${current}/${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < current ? 'text-hok-gold' : 'text-hok-text-muted'} style={{ fontSize: '10px' }}>
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Hero Card ───────────────────────────────────────────────────────

function HeroCard({ hero, onClick }: { hero: Hero; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="hok-card rounded-lg p-3 text-left w-full cursor-pointer group flex gap-3"
    >
      {/* Hero Portrait */}
      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-hok-bg border border-hok-gold/20">
        <img
          src={`/hok-images/heroes/${hero.slug}.jpg`}
          alt={hero.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <TierBadge tier={hero.tier} size="sm" />
          <span className="font-semibold text-hok-text text-sm group-hover:text-hok-gold transition-colors truncate">
            {hero.name}
          </span>
          <span className="text-hok-text-muted text-xs truncate">{hero.chineseName}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-hok-text-secondary">
          <span>{hero.roles?.join(', ') || hero.roles?.[0] || ''}</span>
          <span className="text-hok-text-muted">·</span>
          <span>{hero.classType}</span>
          {hero.rates && hero.rates[0] && (
            <>
              <span className="text-hok-text-muted">·</span>
              <span className="text-hok-gold">{hero.rates[0].winRate}% WR</span>
            </>
          )}
        </div>
        <div className="mt-1">
          <DifficultyStars current={hero.difficulty || 2} max={3} />
        </div>
      </div>
    </button>
  );
}

// ─── Hero Detail Modal ──────────────────────────────────────────────

function HeroDetailModal({ hero, onClose }: { hero: Hero | null; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<'overview' | 'builds' | 'skills'>('overview');

  useEffect(() => {
    if (hero) setActiveSection('overview');
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hero, onClose]);

  if (!hero) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-xl border border-hok-gold/30 bg-[#111] shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Splash Header */}
        <div className="relative h-40 sm:h-56 overflow-hidden">
          <img
            src={`/hok-images/heroes/${hero.slug}-splash.jpg`}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-hok-gold/60 shrink-0 bg-hok-bg">
              <img src={`/hok-images/heroes/${hero.slug}.jpg`} alt={hero.name} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <TierBadge tier={hero.tier} />
                <h2 className="text-xl font-bold text-hok-text">{hero.name}</h2>
                <span className="text-hok-text-muted text-sm">{hero.chineseName}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-hok-text-secondary">
                <span>{hero.roles?.join(', ')}</span>
                <span>·</span>
                <span>{hero.classType}</span>
                {hero.title && <><span>·</span><span className="text-hok-gold italic">{hero.title}</span></>}
              </div>
            </div>
            <button onClick={onClose} className="text-hok-text-muted hover:text-hok-text text-xl leading-none cursor-pointer shrink-0">✕</button>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex border-b border-hok-gold/20">
          {(['overview', 'builds', 'skills'] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeSection === s ? 'border-hok-gold text-hok-gold' : 'border-transparent text-hok-text-muted hover:text-hok-text-secondary'
              }`}>
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeSection === 'overview' && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <InfoBox label="Role" value={hero.roles?.join(', ') || 'N/A'} />
                <InfoBox label="Class" value={`${hero.classType}${hero.subclasses?.[0] ? ` / ${hero.subclasses[0]}` : ''}`} />
                <InfoBox label="Difficulty" value={<DifficultyStars current={hero.difficulty || 2} max={3} />} />
                <InfoBox label="Status" value={
                  <span className={hero.verified ? 'text-hok-green' : 'text-hok-gold'}>
                    {hero.verified ? '✓ Full Data' : '⏳ Limited Data'}
                  </span>
                } />
              </div>

              {/* Win/Pick/Ban Rates */}
              {hero.rates && hero.rates.length > 0 && (
                <div className="bg-hok-bg rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-hok-gold mb-3 uppercase tracking-wider">Rates</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {hero.rates.map((rate, i) => (
                      <React.Fragment key={i}>
                        <MiniStat label="Win Rate" value={`${rate.winRate}%`} color={rate.winRate >= 50 ? '#22C55E' : '#E85D3A'} />
                        <MiniStat label="Pick Rate" value={`${rate.pickRate}%`} color="#C2924C" />
                        <MiniStat label="Ban Rate" value={`${rate.banRate}%`} color="#6B7280" />
                        <div className="col-span-3 text-[11px] text-hok-text-muted mt-1">Role: {rate.role}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Base Stats */}
              {hero.stats?.allStats && (
                <div className="bg-hok-bg rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-hok-gold mb-3 uppercase tracking-wider">Base Stats</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {hero.stats.allStats.map((stat, i) => (
                      <div key={i}>
                        <span className="text-[11px] text-hok-text-muted">{stat.label}</span>
                        <p className="text-sm font-medium text-hok-text">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {hero.summary && (
                <div className="bg-hok-bg rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-hok-gold mb-2 uppercase tracking-wider">Summary</h3>
                  <p className="text-sm text-hok-text-secondary leading-relaxed">{hero.summary}</p>
                </div>
              )}

              {/* Lore */}
              {hero.lore && (
                <details className="bg-hok-bg rounded-lg">
                  <summary className="p-4 text-xs font-semibold text-hok-gold uppercase tracking-wider cursor-pointer">
                    Lore & Background
                  </summary>
                  <div className="px-4 pb-4 text-sm text-hok-text-secondary leading-relaxed">
                    {hero.quote && <p className="italic text-hok-gold/70 mb-2">&ldquo;{hero.quote}&rdquo;</p>}
                    <p>{hero.lore}</p>
                    {hero.nation && <p className="mt-2 text-xs text-hok-text-muted">Nation: {hero.nation} · Faction: {hero.faction || hero.nation}</p>}
                  </div>
                </details>
              )}
            </>
          )}

          {activeSection === 'builds' && (
            <>
              {hero.builds && hero.builds.length > 0 ? (
                <div className="space-y-3">
                  {hero.builds.map((build, i) => (
                    <div key={i} className="bg-hok-bg rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-hok-text">{build.name}</span>
                        <span className="news-badge bg-hok-gold/20 text-hok-gold">{build.badge}</span>
                      </div>
                      {build.description && (
                        <p className="text-xs text-hok-text-secondary mb-3">{build.description}</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {build.items.map((item, j) => (
                          <div key={j} className="flex items-center gap-1.5 bg-hok-bg-elevated rounded-md px-2 py-1">
                            <img
                              src={`/hok-images/items/${item.id}.png`}
                              alt={item.name}
                              className="w-6 h-6 object-contain"
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <span className="text-[11px] text-hok-text">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-hok-text-muted">
                  <p>No build data available for this hero.</p>
                  <p className="text-xs mt-1">This hero may be recently added.</p>
                </div>
              )}
            </>
          )}

          {activeSection === 'skills' && (
            <>
              {hero.skills && hero.skills.length > 0 ? (
                <div className="space-y-3">
                  {hero.skills.map((skill, i) => (
                    <div key={i} className="bg-hok-bg rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="news-badge bg-hok-bg-elevated text-hok-text-secondary uppercase">{skill.slot}</span>
                        <span className="text-sm font-medium text-hok-text">{skill.name}</span>
                      </div>
                      <p className="text-xs text-hok-text-secondary leading-relaxed">{skill.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-hok-text-muted">
                  <p>No skill data available.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-hok-bg rounded-lg p-3">
      <span className="text-[11px] text-hok-text-muted">{label}</span>
      <div className="text-sm font-medium text-hok-text mt-0.5">{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <span className="text-[11px] text-hok-text-muted">{label}</span>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

// ─── Item Card ───────────────────────────────────────────────────────

function ItemCard({ item }: { item: Item }) {
  const catColorMap: Record<string, string> = {
    'Attack': '#E85D3A', 'Magic': '#A855F7', 'Defense': '#5B8BD4',
    'Movement': '#22C55E', 'Jungle': '#C2924C', 'Support': '#6B7280',
    'Attack Equipment': '#E85D3A',
  };
  const color = catColorMap[item.category] || '#999';

  return (
    <div className="hok-card rounded-lg p-3 flex gap-3">
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-hok-bg border border-hok-gold/10 flex items-center justify-center">
        <img src={`/hok-images/items/${item.itemId}.png`} alt={item.name}
          className="w-full h-full object-contain" loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-hok-text">{item.name}</span>
          {item.isTopTier && <span className="text-[10px] text-hok-gold">★</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px]" style={{ color }}>{item.category}</span>
          <span className="text-xs text-hok-gold font-medium">{item.price}g</span>
        </div>
        {item.tagline && <p className="text-[11px] text-hok-text-muted mt-1 truncate">{item.tagline}</p>}
      </div>
    </div>
  );
}

// ─── Arcana Card ──────────────────────────────────────────────────────

function ArcanaCard({ a }: { a: Arcana }) {
  const colorMap: Record<ArcanaColor, string> = { Red: '#E85D3A', Purple: '#A855F7', Blue: '#5B8BD4', Green: '#22C55E' };
  const clsMap: Record<ArcanaColor, string> = { Red: 'arcana-red', Purple: 'arcana-purple', Blue: 'arcana-blue', Green: 'arcana-green' };

  return (
    <div className={`hok-card rounded-lg p-3 ${clsMap[a.color]} flex gap-3 items-center`}>
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-hok-bg flex items-center justify-center">
        <img src={a.image} alt={a.name} className="w-8 h-8 object-contain" loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-hok-text">{a.name}</span>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMap[a.color] }} />
        </div>
        <div className="flex gap-2 mt-1 flex-wrap">
          <span className="text-[11px] text-hok-gold">{a.stats}</span>
          <span className="text-[10px] text-hok-text-muted">Lv.{a.level}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Patch Content Parser ──────────────────────────────────────────
function parsePatchContent(content: string): PatchNote[] {
  const results: PatchNote[] = [];

  // All known hero names for matching
  const heroNames: Record<string, string> = {};
  heroes.forEach(h => {
    heroNames[h.name.toLowerCase()] = h.slug;
    // Also map by chinese name
    if (h.chineseName) heroNames[h.chineseName] = h.slug;
  });

  // Extract version/season from content
  const seasonMatch = content.match(/S\d{1,2}/i) || content.match(/Season\s*\d{1,2}/i);
  const dateMatch = content.match(/20\d{2}\/\d{2}\/\d{2}/) || content.match(/\d{4}-\d{2}-\d{2}/) || content.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{1,2},?\s*20\d{2}/i);

  const season = seasonMatch ? seasonMatch[0].toUpperCase() : 'NEW';
  const patchDate = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];

  // Split content into sections by hero name mentions
  const lines = content.split(/\n/).map(l => l.trim()).filter(Boolean);
  const changes: PatchChange[] = [];
  const foundHeroes = new Set<string>();

  // Look for patterns like "Hero Name:" followed by description
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const [name, slug] of Object.entries(heroNames)) {
      if (foundHeroes.has(slug)) continue;

      // Check if this line mentions a hero name prominently
      const regex = new RegExp(`\\b${name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(line)) {
        // Get surrounding context (this line + next few lines)
        const contextLines = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');

        // Determine change type
        let changeType = 'Adjustment';
        const lowerCtx = contextLines.toLowerCase();
        if (lowerCtx.includes('new hero') || lowerCtx.includes('joining the roster') || lowerCtx.includes('brand-new')) {
          changeType = 'New Hero';
        } else if (lowerCtx.includes('mechanic') && (lowerCtx.includes('upgrade') || lowerCtx.includes('improve') || lowerCtx.includes('rework'))) {
          changeType = 'Mechanic Upgrade';
        } else if (lowerCtx.includes('buff') || lowerCtx.includes('increase') || lowerCtx.includes('improve') || lowerCtx.includes('reduced') || lowerCtx.includes('boost')) {
          changeType = 'Buff';
        } else if (lowerCtx.includes('nerf') || lowerCtx.includes('decrease') || lowerCtx.includes('reduc') || lowerCtx.includes('lower')) {
          changeType = 'Nerf';
        }

        // Extract summary (first meaningful sentence about this hero)
        const sentences = contextLines.split(/[.!?]/).filter(s => s.trim().length > 10);
        const summary = sentences[0]?.trim().slice(0, 150) || `${name} changes in ${season}`;

        changes.push({
          heroSlug: slug,
          heroName: name.charAt(0).toUpperCase() + name.slice(1),
          changeType,
          summary,
          details: contextLines.slice(0, 300),
        });

        foundHeroes.add(slug);
        break; // One hero per section
      }
    }
  }

  if (changes.length > 0) {
    // Try to extract title
    const titleMatch = content.match(/Version Update/i) || content.match(/Patch Notes/i);
    results.push({
      patchDate,
      season,
      heroCount: changes.length,
      changes,
      title: titleMatch ? `${season} ${titleMatch[0]}` : `${season} Scraped Patch`,
      source: 'tavily-scrape',
    });
  }

  return results;
}

// ─── Patch Card ──────────────────────────────────────────────────────

function PatchCard({ patch }: { patch: PatchNote }) {
  return (
    <div className="hok-card rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="news-badge patch-major font-bold">Patch</span>
            <span className="text-hok-gold font-semibold text-sm">{patch.season}</span>
          </div>
          <p className="text-xs text-hok-text-secondary mt-1">
            {patch.patchDate} · {patch.heroCount} hero changes
          </p>
        </div>
      </div>
      {/* Changed Heroes */}
      <div className="mt-3 pt-3 border-t border-hok-gold/10">
        <div className="flex gap-2 flex-wrap">
          {patch.changes.map((change, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-hok-bg rounded-md px-2 py-1">
              <img
                src={`/hok-images/heroes/${change.heroSlug}.jpg`}
                alt={change.heroName}
                className="w-5 h-5 rounded object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="text-[11px] text-hok-text">{change.heroName}</span>
              <span className={`text-[10px] px-1 rounded ${
                change.changeType.includes('Buff') ? 'bg-green-500/20 text-green-400' :
                change.changeType.includes('Nerf') ? 'bg-red-500/20 text-red-400' :
                'bg-hok-gold/20 text-hok-gold'
              }`}>{change.changeType}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── News Card ───────────────────────────────────────────────────────

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a href={article.link || '#'} target="_blank" rel="noopener noreferrer"
      className="hok-card rounded-lg p-4 block group">
      <div className="flex gap-3">
        {article.imageUrl && (
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-hok-bg">
            <img src={article.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`news-badge font-medium ${article.isPatch ? 'bg-hok-gold/20 text-hok-gold' : 'bg-hok-bg-hover text-hok-text-secondary'}`}>
              {article.category}
            </span>
            <span className="text-[11px] text-hok-text-muted">{article.date}</span>
          </div>
          <h3 className="text-sm font-medium text-hok-text mt-1.5 group-hover:text-hok-gold transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.description && <p className="text-xs text-hok-text-secondary mt-1 line-clamp-2">{article.description}</p>}
        </div>
      </div>
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('heroes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  // Filters
  const [tierFilter, setTierFilter] = useState<Tier | 'All'>('All');
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
  const [classFilter, setClassFilter] = useState<HeroClass | 'All'>('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('All');
  const [arcanaColorFilter, setArcanaColorFilter] = useState<ArcanaColor | 'All'>('All');

  // News
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsFilter, setNewsFilter] = useState<'all' | 'patches'>('all');
  const [lastFetch, setLastFetch] = useState('');

  // Static fallback news data (used in static export mode)
  const staticNews: NewsArticle[] = [
    {
      id: "static-1",
      title: "S15 The Grand Venture Version Update",
      date: "2026-06-17",
      category: "ALL NEWS",
      description: "A non-disruptive global server update is planned for 6/17. The game will begin the season data maintenance 1.5 hours before the update.",
      isPatch: true,
      link: "https://www.honorofkings.com/global-en/news-list.html",
    },
    {
      id: "static-2",
      title: "Server Update Announcement - 6/19",
      date: "2026-06-19",
      category: "ALL NEWS",
      description: "A non-disruptive global server update is planned for 6/19 at 03:00-04:00 (UTC+0). Update scope: All servers.",
      isPatch: true,
      link: "https://www.honorofkings.com/global-en/news-list.html",
    },
    {
      id: "static-3",
      title: "New Hero: Aoyin Available Now",
      date: "2026-06-10",
      category: "ALL NEWS",
      description: "The dark serpent assassin Aoyin joins the roster. Master his shadow abilities and dominate the battlefield.",
      isPatch: false,
      link: "https://www.honorofkings.com/global-en/news-list.html",
    },
  ];

  const fetchNews = useCallback(async (forceRefresh = false) => {
    setNewsLoading(true);
    try {
      const res = await fetch('/api/news', { method: forceRefresh ? 'POST' : 'GET' });
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        setNewsArticles(data.articles);
        if (data.lastFetched) setLastFetch(data.lastFetched);
      } else {
        setNewsArticles(staticNews);
      }
    } catch {
      setNewsArticles(staticNews);
    } finally { setNewsLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'news' && newsArticles.length === 0) fetchNews();
  }, [activeTab, newsArticles.length, fetchNews]);

  // ─── Patch Scraper State ──────────────────────────────────────────
  const [tavilyKey, setTavilyKey] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('tavily_key') || '' : '');
  const [scrapeUrl, setScrapeUrl] = useState('https://www.honorofkings.com/global-en/news-list.html');
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [searchResults, setSearchResults] = useState<{ title: string; url: string; snippet: string }[]>([]);
  const [scrapedPatches, setScrapedPatches] = useState<PatchNote[]>([]);
  const [showScraper, setShowScraper] = useState(false);

  const saveTavilyKey = useCallback((key: string) => {
    setTavilyKey(key);
    localStorage.setItem('tavily_key', key);
  }, []);

  const callTavily = useCallback(async (mode: string, params: Record<string, string>) => {
    const qp = new URLSearchParams({ mode, ...params });
    const res = await fetch(`/api/tavily?${qp}`, {
      headers: tavilyKey ? { 'X-Tavily-Key': tavilyKey } : {},
    });
    return res.json();
  }, [tavilyKey]);

  const handleSearchPatches = useCallback(async () => {
    if (!tavilyKey) { setScrapeError('Enter your Tavily API key first'); return; }
    setScrapeLoading(true); setScrapeError(''); setSearchResults([]);
    try {
      const data = await callTavily('search', { query: 'Honor of Kings latest patch notes hero balance adjustments 2026', max_results: '8' });
      if (data.success) setSearchResults(data.results || []);
      else setScrapeError(data.error || 'Search failed');
    } catch { setScrapeError('Failed to search. Check your API key.'); } finally { setScrapeLoading(false); }
  }, [tavilyKey, callTavily]);

  const handleScrapeUrl = useCallback(async (url?: string) => {
    const targetUrl = url || scrapeUrl;
    if (!tavilyKey) { setScrapeError('Enter your Tavily API key first'); return; }
    if (!targetUrl) { setScrapeError('Enter a URL to scrape'); return; }
    setScrapeLoading(true); setScrapeError('');
    try {
      const data = await callTavily('extract', { url: targetUrl });
      if (data.success && data.results?.[0]?.content) {
        const parsed = parsePatchContent(data.results[0].content);
        if (parsed.length > 0) {
          setScrapedPatches(prev => [...parsed, ...prev]);
        } else {
          setScrapeError('No patch data found in the page content. Try a different URL.');
        }
      } else {
        setScrapeError(data.error || 'Could not extract content from URL.');
      }
    } catch { setScrapeError('Scrape failed. Check your API key and URL.'); } finally { setScrapeLoading(false); }
  }, [tavilyKey, scrapeUrl, callTavily]);

  // Filtered data
  const filteredHeroes = useMemo(() => {
    let result = [...heroes];
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter(h => h.name.toLowerCase().includes(q) || h.chineseName?.includes(q)); }
    if (tierFilter !== 'All') result = result.filter(h => h.tier === tierFilter);
    if (roleFilter !== 'All') result = result.filter(h => h.roles?.includes(roleFilter));
    if (classFilter !== 'All') result = result.filter(h => h.classType === classFilter);
    if (verifiedOnly) result = result.filter(h => h.verified);
    const tierOrder: Record<Tier, number> = { S: 0, A: 1, B: 2, C: 3 };
    result.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
    return result;
  }, [searchQuery, tierFilter, roleFilter, classFilter, verifiedOnly]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter(i => i.name.toLowerCase().includes(q)); }
    if (itemCategoryFilter !== 'All') result = result.filter(i => i.category === itemCategoryFilter);
    return result;
  }, [searchQuery, itemCategoryFilter]);

  const filteredArcana = useMemo(() => {
    let result = [...arcana];
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter(a => a.name.toLowerCase().includes(q)); }
    if (arcanaColorFilter !== 'All') result = result.filter(a => a.color === arcanaColorFilter);
    return result;
  }, [searchQuery, arcanaColorFilter]);

  const filteredNews = useMemo(() => {
    if (newsFilter === 'patches') return newsArticles.filter(a => a.isPatch);
    return newsArticles;
  }, [newsArticles, newsFilter]);

  useEffect(() => { setSearchQuery(''); }, [activeTab]);

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'heroes', label: 'Heroes', count: heroes.length },
    { key: 'items', label: 'Items', count: items.length },
    { key: 'arcana', label: 'Arcana', count: arcana.length },
    { key: 'patches', label: 'Patches', count: patches.length },
    { key: 'news', label: 'News', count: newsArticles.length },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at 50% 0%, #C2924C 0%, transparent 70%)' }} />
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 border-hok-gold/40 shadow-lg shadow-hok-gold/10">
              <img
                src="/hok-icon.png"
                alt="Honor of Kings"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-hok-text">Honor of Kings Database</h1>
              <p className="text-xs sm:text-sm text-hok-text-secondary">Heroes · Items · Arcana · Patches · Live News</p>
            </div>
          </div>
          <div className="flex gap-4 sm:gap-6 flex-wrap mt-6">
            {[
              { label: 'heroes', count: heroes.length },
              { label: 'items', count: items.length },
              { label: 'arcana', count: arcana.length },
              { label: 'patches', count: patches.length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <span className="block text-xl sm:text-2xl font-bold text-hok-gold">{s.count}</span>
                <span className="text-xs text-hok-text-muted capitalize">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-0 z-40 border-b border-hok-gold/20" style={{ backgroundColor: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  activeTab === tab.key ? 'border-hok-gold text-hok-gold' : 'border-transparent text-hok-text-secondary hover:text-hok-text-muted'
                }`}>
                {tab.label}
                <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-hok-gold' : 'text-hok-text-muted'}`}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* ─── Heroes ─── */}
        {activeTab === 'heroes' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hok-text-muted text-sm">🔍</span>
                <input type="text" placeholder="Search heroes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-hok-bg-card border border-hok-gold/20 text-sm text-hok-text placeholder:text-hok-text-muted focus:outline-none focus:border-hok-gold transition-colors" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <FilterSelect value={tierFilter} onChange={v => setTierFilter(v)} options={['All', ...allTiers]} label="All Tiers" format={v => v === 'All' ? v : `Tier ${v}`} />
                <FilterSelect value={roleFilter} onChange={v => setRoleFilter(v as Role | 'All')} options={['All', ...allRoles]} label="All Roles" />
                <FilterSelect value={classFilter} onChange={v => setClassFilter(v as HeroClass | 'All')} options={['All', ...allClasses]} label="All Classes" />
                <button onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                    verifiedOnly ? 'bg-hok-gold/20 border-hok-gold text-hok-gold' : 'bg-hok-bg-card border-hok-gold/20 text-hok-text-secondary'
                  }`}>
                  {verifiedOnly ? '✓ Verified' : 'Verified only'}
                </button>
              </div>
            </div>
            <p className="text-xs text-hok-text-muted">{filteredHeroes.length} of {heroes.length} heroes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredHeroes.map(hero => <HeroCard key={hero.slug} hero={hero} onClick={() => setSelectedHero(hero)} />)}
            </div>
          </div>
        )}

        {/* ─── Items ─── */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hok-text-muted text-sm">🔍</span>
                <input type="text" placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-hok-bg-card border border-hok-gold/20 text-sm text-hok-text placeholder:text-hok-text-muted focus:outline-none focus:border-hok-gold transition-colors" />
              </div>
              <FilterSelect value={itemCategoryFilter} onChange={setItemCategoryFilter} options={['All', ...allCategories]} label="All Categories" />
            </div>
            <p className="text-xs text-hok-text-muted">{filteredItems.length} of {items.length} items</p>
            {allCategories.map(cat => {
              const catItems = filteredItems.filter(i => i.category === cat);
              if (catItems.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="text-sm font-semibold text-hok-gold mb-2 mt-4 first:mt-0">{cat}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {catItems.map(item => <ItemCard key={item.itemId} item={item} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Arcana ─── */}
        {activeTab === 'arcana' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hok-text-muted text-sm">🔍</span>
                <input type="text" placeholder="Search arcana..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-hok-bg-card border border-hok-gold/20 text-sm text-hok-text placeholder:text-hok-text-muted focus:outline-none focus:border-hok-gold transition-colors" />
              </div>
              <FilterSelect value={arcanaColorFilter} onChange={v => setArcanaColorFilter(v as ArcanaColor | 'All')} options={['All', ...allArcanaColors]} label="All Colors" />
            </div>
            <p className="text-xs text-hok-text-muted">{filteredArcana.length} of {arcana.length} arcana</p>
            {allArcanaColors.map(color => {
              const colorArcana = filteredArcana.filter(a => a.color === color);
              if (colorArcana.length === 0) return null;
              return (
                <div key={color}>
                  <h3 className="text-sm font-semibold text-hok-gold mb-2 mt-4 first:mt-0">{color}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {colorArcana.map(a => <ArcanaCard key={a.arcanaId} a={a} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Patches ─── */}
        {activeTab === 'patches' && (
          <div className="space-y-3">
            {/* Patch Scraper */}
            <div className="hok-card rounded-lg p-4">
              <button onClick={() => setShowScraper(!showScraper)}
                className="flex items-center gap-2 text-sm font-medium text-hok-gold hover:text-hok-gold-light transition-colors cursor-pointer w-full text-left">
                <span className={`transition-transform ${showScraper ? 'rotate-90' : ''}`}>{'▶'}</span>
                <span> Patch Scraper (Tavily)</span>
              </button>

              {showScraper && (
                <div className="mt-3 space-y-3">
                  {/* API Key */}
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Tavily API Key"
                      value={tavilyKey}
                      onChange={e => saveTavilyKey(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-md bg-hok-bg border border-hok-gold/20 text-xs text-hok-text placeholder:text-hok-text-muted focus:outline-none focus:border-hok-gold"
                    />
                  </div>

                  {/* URL Bar + Scrape */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste a patch notes URL..."
                      value={scrapeUrl}
                      onChange={e => setScrapeUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-md bg-hok-bg border border-hok-gold/20 text-xs text-hok-text placeholder:text-hok-text-muted focus:outline-none focus:border-hok-gold"
                    />
                    <button onClick={() => handleScrapeUrl()} disabled={scrapeLoading}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-hok-gold/20 border border-hok-gold text-hok-gold hover:bg-hok-gold/30 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap">
                      {scrapeLoading ? '⟳' : '⚡ Scrape'}
                    </button>
                  </div>

                  {/* Auto-detect button */}
                  <button onClick={handleSearchPatches} disabled={scrapeLoading}
                    className="w-full px-3 py-2 rounded-md text-xs font-medium bg-hok-bg border border-hok-gold/20 text-hok-text-secondary hover:text-hok-gold hover:border-hok-gold/40 transition-all cursor-pointer disabled:opacity-50">
                    {scrapeLoading ? '⟳ Searching...' : '🔍 Auto-detect Latest Patches'}
                  </button>

                  {/* Error */}
                  {scrapeError && (
                    <p className="text-xs text-hok-red bg-red-500/10 rounded-md px-3 py-2">{scrapeError}</p>
                  )}

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-hok-text-muted font-medium">Found {searchResults.length} results — click to scrape:</p>
                      {searchResults.map((r, i) => (
                        <button key={i} onClick={() => handleScrapeUrl(r.url)}
                          className="w-full text-left hok-card rounded-md px-3 py-2 cursor-pointer group">
                          <p className="text-xs text-hok-text group-hover:text-hok-gold transition-colors line-clamp-1">{r.title}</p>
                          <p className="text-[10px] text-hok-text-muted mt-0.5 line-clamp-1">{r.snippet}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Scraped patches count */}
                  {scrapedPatches.length > 0 && (
                    <p className="text-xs text-hok-green">✓ {scrapedPatches.length} scraped patch(es) added below</p>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-hok-text-muted">{patches.length} built-in + {scrapedPatches.length} scraped patches</p>
            {scrapedPatches.map((patch, i) => <PatchCard key={`scraped-${i}`} patch={patch} />)}
            {patches.map((patch, i) => <PatchCard key={i} patch={patch} />)}
          </div>
        )}

        {/* ─── News ─── */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                <button onClick={() => setNewsFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                    newsFilter === 'all' ? 'bg-hok-gold/20 border-hok-gold text-hok-gold' : 'bg-hok-bg-card border-hok-gold/20 text-hok-text-secondary'
                  }`}>All News</button>
                <button onClick={() => setNewsFilter('patches')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                    newsFilter === 'patches' ? 'bg-hok-gold/20 border-hok-gold text-hok-gold' : 'bg-hok-bg-card border-hok-gold/20 text-hok-text-secondary'
                  }`}>Patch Notes Only</button>
              </div>
              <button onClick={() => fetchNews(true)} disabled={newsLoading}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-hok-bg-card border border-hok-gold/30 text-hok-gold hover:bg-hok-gold/10 transition-all cursor-pointer disabled:opacity-50">
                {newsLoading ? '⟳ Fetching...' : '↻ Refresh'}
              </button>
            </div>
            {lastFetch && <p className="text-[11px] text-hok-text-muted">Last scraped: {new Date(lastFetch).toLocaleString()}</p>}
            {newsLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="hok-card rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg shimmer" />
                      <div className="flex-1 space-y-2"><div className="h-3 w-20 shimmer rounded" /><div className="h-4 w-3/4 shimmer rounded" /><div className="h-3 w-1/2 shimmer rounded" /></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNews.length > 0 ? (
              <div className="space-y-2">{filteredNews.map(a => <NewsCard key={a.id} article={a} />)}</div>
            ) : (
              <div className="text-center py-12 text-hok-text-muted"><p>No articles found</p></div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-hok-gold/10 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-hok-text-muted">
            <div className="flex items-center gap-2">
              <img src="/hok-icon-32.png" alt="HoK" className="w-5 h-5" />
              <span>Honor of Kings Database</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Source: <a href="https://www.hokstats.gg" target="_blank" rel="noopener noreferrer" className="text-hok-gold hover:underline">hokstats.gg</a></span>
              <span>·</span>
              <span>News: <a href="https://www.honorofkings.com/global-en/news-list.html" target="_blank" rel="noopener noreferrer" className="text-hok-gold hover:underline">honorofkings.com</a></span>
              <span>·</span>
              <span>Images: <a href="https://github.com/Roo0722/hokdatabase" target="_blank" rel="noopener noreferrer" className="text-hok-gold hover:underline">GitHub</a></span>
            </div>
          </div>
        </div>
      </footer>

      <HeroDetailModal hero={selectedHero} onClose={() => setSelectedHero(null)} />
    </div>
  );
}

// ─── Shared FilterSelect ────────────────────────────────────────────

function FilterSelect<T extends string>({ value, onChange, options, label, format }: {
  value: T; onChange: (v: T) => void; options: T[]; label: string; format?: (v: T) => string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as T)}
      className="px-3 py-1.5 rounded-md bg-hok-bg-card border border-hok-gold/20 text-xs text-hok-text cursor-pointer focus:outline-none focus:border-hok-gold">
      {options.map(o => <option key={o} value={o}>{format ? format(o) : o}</option>)}
    </select>
  );
}
