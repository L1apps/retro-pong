import { Difficulty, Theme } from './types.ts';

export const BASE_WIDTH = 800;
export const BASE_HEIGHT = 600;

// Paddle dimensions are now relative to orientation
export const PADDLE_LENGTH = 80;     // The long side of the paddle
export const PADDLE_THICKNESS = 15;  // The short side of the paddle

export const PADDLE_OFFSET = 20;     // Distance from the wall
export const BALL_RADIUS = 8;

export const INITIAL_BALL_SPEED = 7;
export const MAX_BALL_SPEED = 16;
export const SPEED_INCREMENT = 0.5;

export const THEMES = {
  [Theme.CLASSIC]: {
    BACKGROUND: '#000000',
    FOREGROUND: '#FFFFFF', // Paddles, Ball, Text
    ACCENT: '#888888',     // Secondary UI
    DIM: '#333333'         // Inactive/Grid
  },
  [Theme.GREEN]: {
    BACKGROUND: '#051105',
    FOREGROUND: '#33FF33',
    ACCENT: '#117711',
    DIM: '#082208'
  },
  [Theme.AMBER]: {
    BACKGROUND: '#110d00',
    FOREGROUND: '#FFB000',
    ACCENT: '#996600',
    DIM: '#221a00'
  }
};

export const AI_SPEED_FACTOR = {
  [Difficulty.EASY]: 0.08,
  [Difficulty.MEDIUM]: 0.12,
  [Difficulty.HARD]: 0.25
};

export const WINNING_SCORE_OPTIONS = [5, 10, 21];