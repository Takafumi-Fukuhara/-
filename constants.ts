import { TileType, Enemy } from './types';

export const TILE_SIZE = 40; // in pixels
export const BOARD_WIDTH = 15;
export const BOARD_HEIGHT = 13;

export const PLAYER_START_POS = { x: 1, y: 1 };
export const BOMB_TIMER = 3000; // 3 seconds
export const EXPLOSION_TIMER = 500; // 0.5 seconds
export const ENEMY_MOVE_INTERVAL = 1000; // 1 second

const W = TileType.WALL;
const F = TileType.FLOOR;
const P = TileType.PARTITION;

// New map where walls form the letters 'D' and 'X'
export const LEVEL_1_MAP: TileType[][] = [
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 0
    [W,F,P,F,P,F,P,F,P,F,P,F,P,F,W], // 1
    [W,P,W,W,W,F,P,F,W,F,W,P,F,P,W], // 2
    [W,F,W,F,F,W,P,F,F,W,F,W,P,F,W], // 3
    [W,P,W,F,F,W,P,F,F,F,W,F,P,F,W], // 4
    [W,F,W,F,F,W,P,F,F,W,F,W,P,F,W], // 5
    [W,P,W,W,W,F,P,F,W,F,W,P,F,P,W], // 6
    [W,F,P,F,P,F,P,F,P,F,P,F,P,F,W], // 7
    [W,P,P,P,P,P,P,P,P,P,P,P,P,P,W], // 8
    [W,F,P,F,P,F,P,F,P,F,P,F,P,F,W], // 9
    [W,P,P,P,P,P,P,P,P,P,P,P,P,P,W], // 10
    [W,F,P,F,P,F,P,F,P,F,P,F,P,F,W], // 11
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 12
];


export const INITIAL_ENEMIES: Enemy[] = [
  { id: 1, position: { x: 13, y: 1 } },
  { id: 2, position: { x: 1, y: 11 } },
  { id: 3, position: { x: 7, y: 4 } },
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
