export enum TileType {
  FLOOR,
  WALL,
  PARTITION, // Destructible wall
}

export enum PowerUpType {
  Flame,
  Bomb,
  Speed,
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

export interface PowerUp {
  position: Position;
  type: PowerUpType;
}

export interface FlyerParticle {
  id: string;
  pos: Position;
  style: React.CSSProperties;
}

export interface FeedbackMessage {
  id: string;
  text: string;
  position: Position;
}

export interface PlayerStats {
  maxBombs: number;
  bombRange: number;
  speed: number; // transition duration in seconds
}

export type GameState = 'start' | 'ready' | 'playing' | 'gameOver' | 'levelClear';

export type GameOverReason = 'hit' | 'timeUp';

// Fix: Add and export the IconName type, which is used by several components.
export type IconName = 'player' | 'bomb' | 'enemy' | 'item' | 'stage' | 'vip';