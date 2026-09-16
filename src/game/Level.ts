import { Direction } from './Cat';

export interface CatData {
  id: number;
  x: number;
  y: number;
  direction: Direction;
  skin?: string;
}

export interface LevelPerformanceConfig {
  goldTimeMs: number;
  silverTimeMs: number;
  comboTarget: number;
}

export interface LevelData {
  id: number;
  chapter: number;
  name: string;
  width: number;
  height: number;
  cats: CatData[];
  performance?: LevelPerformanceConfig;
}
