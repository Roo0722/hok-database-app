export type ArcanaColor = 'Red' | 'Purple' | 'Blue' | 'Green';

export interface Arcana {
  arcanaId: string;
  name: string;
  level: number;
  color: ArcanaColor;
  stats: string;
  image: string;
}

import arcanaDataRaw from '@/data/arcana-enriched.json';

export const arcana: Arcana[] = arcanaDataRaw as unknown as Arcana[];

export const allArcanaColors: ArcanaColor[] = ['Red', 'Purple', 'Blue', 'Green'];
