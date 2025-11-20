
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  DEMO = 'DEMO'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum Orientation {
  LANDSCAPE = 'LANDSCAPE', // Player Left, AI Right
  PORTRAIT = 'PORTRAIT'    // Player Bottom, AI Top
}

export enum Theme {
  CLASSIC = 'CLASSIC', // Black & White
  GREEN = 'GREEN',     // Retro Terminal Green
  AMBER = 'AMBER'      // Retro Terminal Amber
}

export enum TextSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}

export interface GameSettings {
  soundEnabled: boolean;
  difficulty: Difficulty;
  winningScore: number;
  ballSpeedMultiplier: number; // 0.5 to 2.0
  paddleSensitivity: number;   // 0.01 to 0.5 (Lerp factor)
  orientation: Orientation;
  theme: Theme;
  effectsEnabled: boolean; // Master switch for all visual FX
  crtEffect: boolean;
  fuzzyBackground: boolean;
  glitchEffect: boolean;
  trailLength: number; // 0.0 to 1.0 (None to Long)
  textSize: TextSize;
}

export interface Vector {
  x: number;
  y: number;
}

export interface BallState extends Vector {
  vx: number;
  vy: number;
  speed: number;
  radius: number;
}

export interface PaddleState {
  x: number;
  y: number;
  height: number;
  width: number;
  score: number;
}
