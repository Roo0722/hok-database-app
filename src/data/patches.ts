export interface PatchChange {
  heroSlug: string;
  heroName: string;
  changeType: string;
  summary: string;
  details: string;
}

export interface PatchNote {
  patchDate: string;
  season: string;
  heroCount: number;
  changes: PatchChange[];
  title?: string;
  source?: string;
}

import patchesDataRaw from '@/data/patches-enriched.json';

export const patches: PatchNote[] = (patchesDataRaw as unknown as PatchNote[]).map((p, i) => ({
  ...p,
  title: p.title || `Season ${p.season} Patch`,
  id: `patch-${i}`,
}));
