export type Tier = 'S' | 'A' | 'B' | 'C';
export type Role = 'Clash Lane' | 'Jungle' | 'Mid' | 'Roam' | 'Farm';
export type HeroClass = 'Mage' | 'Fighter' | 'Tank' | 'Assassin' | 'Support' | 'Marksman';

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroSkill {
  slot: string;
  name: string;
  description: string;
  image?: string;
}

export interface BuildItem {
  id: string;
  name: string;
}

export interface HeroBuild {
  name: string;
  badge: string;
  description: string;
  position?: string;
  items: BuildItem[];
  source?: string | null;
}

export interface HeroRate {
  role: Role;
  winRate: number;
  pickRate: number;
  banRate: number;
}

export interface Hero {
  slug: string;
  name: string;
  chineseName: string;
  tierKey: string;
  tier: Tier;
  roles: Role[];
  difficulty: number;
  classType: HeroClass;
  subclasses: string[];
  title?: string;
  race?: string;
  height?: string;
  style?: string;
  nation?: string;
  faction?: string;
  quote?: string;
  lore?: string;
  summary?: string;
  lastUpdated?: string;
  heroImgId?: string;
  verified: boolean;
  stats?: {
    allStats: HeroStat[];
    maxHp?: number;
    physDef?: number;
    magDef?: number;
    hpPer5s?: number;
    physAtk?: number;
    moveSpeed?: number;
    maxMana?: number;
    manaPer5s?: number;
  };
  skills?: HeroSkill[];
  builds?: HeroBuild[];
  rates?: HeroRate[];
  synergies?: string[];
}

// Enriched data is loaded from heroes-enriched.json at build time
// But we also export typed accessors for the static fallback
import heroesDataRaw from '@/data/heroes-enriched.json';

export const heroes: Hero[] = (heroesDataRaw as unknown as Hero[]).map(h => ({
  ...h,
  verified: !!h.builds && h.builds.length > 0,
}));

export const allRoles: Role[] = ['Clash Lane', 'Jungle', 'Mid', 'Roam', 'Farm'];
export const allClasses: HeroClass[] = ['Mage', 'Fighter', 'Tank', 'Assassin', 'Support', 'Marksman'];
export const allTiers: Tier[] = ['S', 'A', 'B', 'C'];
