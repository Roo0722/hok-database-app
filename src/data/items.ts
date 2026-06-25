export interface ItemComponent {
  id: string;
  name: string;
  price?: number;
}

export interface ItemUsedBy {
  slug: string;
  name: string;
  role: string;
}

export interface Item {
  itemId: string;
  name: string;
  image: string;
  price: number;
  tier: number;
  category: string;
  tagline: string;
  isTopTier: boolean;
  components: ItemComponent[];
  usedBy: ItemUsedBy[];
  description: string;
}

import itemsDataRaw from '@/data/items-enriched.json';

export const items: Item[] = itemsDataRaw as unknown as Item[];

export const allCategories: string[] = [...new Set(items.map(i => i.category))].sort();
