export enum TileType {
  FLOOR,
  WALL,
  PARTITION, // Destructible wall
}

export interface Position {
  x: number;
  y: number;
}

export interface Bomb {
  position: Position;
  timer: number; // timestamp for explosion
  range: number;
}

export interface Enemy {
  id: number;
  position: Position;
}

export interface FlyerParticle {
  id: string;
  pos: Position;
  style: React.CSSProperties;
}

export type GameState = 'start' | 'playing' | 'gameOver' | 'levelClear';

// Fix: Add and export the IconName type, which is used by several components.
export type IconName = 'player' | 'bomb' | 'enemy' | 'item' | 'stage' | 'vip';