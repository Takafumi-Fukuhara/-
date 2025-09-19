import { TileType, Enemy, PlayerStats } from './types';

export const TILE_SIZE = 40; // in pixels
export const BOARD_WIDTH = 15;
export const BOARD_HEIGHT = 13;

export const PLAYER_START_POS = { x: 1, y: 1 };
export const BOMB_TIMER = 3000; // 3 seconds
export const EXPLOSION_TIMER = 500; // 0.5 seconds
export const ENEMY_MOVE_INTERVAL = 1000; // 1 second
export const LEVEL_TIME = 180; // 3 minutes

export const INITIAL_PLAYER_STATS: PlayerStats = {
  maxBombs: 1,
  bombRange: 1,
  speed: 0.1, // css transition duration
};

export const POWERUP_DROP_CHANCE = 0.3; // 30%

const W = TileType.WALL;
const F = TileType.FLOOR;
const P = TileType.PARTITION;

// Classic Bomberman-style Map Layout
export const LEVEL_1_MAP: TileType[][] = [
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
    [W,F,F,P,P,P,P,P,P,P,P,P,F,F,W],
    [W,F,W,P,W,P,W,P,W,P,W,P,W,F,W],
    [W,P,P,P,P,P,P,P,P,P,P,P,P,P,W],
    [W,P,W,P,W,P,W,P,W,P,W,P,W,P,W],
    [W,P,P,P,P,P,F,F,F,P,P,P,P,P,W],
    [W,F,W,P,W,P,F,F,F,P,W,P,W,F,W],
    [W,P,P,P,P,P,F,F,F,P,P,P,P,P,W],
    [W,P,W,P,W,P,W,P,W,P,W,P,W,P,W],
    [W,P,P,P,P,P,P,P,P,P,P,P,P,P,W],
    [W,F,W,P,W,P,W,P,W,P,W,P,W,F,W],
    [W,F,F,P,P,P,P,P,P,P,P,P,F,F,W],
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];


export const INITIAL_ENEMIES: Enemy[] = [
  { id: 1, position: { x: 13, y: 1 } },
  { id: 2, position: { x: 1, y: 11 } },
  { id: 3, position: { x: 7, y: 5 } },
  { id: 4, position: { x: 13, y: 11 } },
];

// Fix: Add and export PROMPT_SUGGESTIONS, which is used by ImageGenerator.tsx.
export const PROMPT_SUGGESTIONS = [
  {
    label: 'タイトル画面 (Title Screen)',
    prompt: '2D game title screen. A salaryman character in a suit, resembling the classic Bomberman, stands heroically. The game title "オフィス爆弾戦士！ビッグサイト大作戦" (Office Bomber: Big Sight Mayhem!) is prominently displayed with explosive, dynamic fonts. The background shows a stylized, chaotic scene of the Tokyo Big Sight convention center. Vibrant, slightly comedic cartoon style.'
  },
  {
    label: 'ゲームプレイ (Gameplay)',
    prompt: 'Top-down 2D game screenshot. A maze-like level inside the Tokyo Big Sight. A salaryman Bomberman character has just placed a bomb. Enemy "leaflet distributors" are walking nearby, holding stacks of flyers. The art style is a colorful and slightly comical cartoon style. Partitions between booths are exploding.'
  },
  {
    label: 'VIPアイテム (VIP Item)',
    prompt: 'Close-up shot in a 2D cartoon game style. The salaryman Bomberman character touches a sparkling, golden "VIP" item. The character starts to glow with a powerful aura, and the bomb he holds transforms into a larger, more ornate "VIP Bomb". The background is a blur of the convention hall, focusing on the power-up moment.'
  }
];