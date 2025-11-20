
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Difficulty, GameSettings, BallState, PaddleState, Orientation, Theme, TextSize } from '../types.ts';
import { 
  BASE_WIDTH, BASE_HEIGHT, 
  PADDLE_THICKNESS, PADDLE_LENGTH, 
  PADDLE_OFFSET, BALL_RADIUS, INITIAL_BALL_SPEED, MAX_BALL_SPEED, 
  SPEED_INCREMENT, THEMES, AI_SPEED_FACTOR 
} from '../constants.ts';
import { soundManager } from '../services/soundService.ts';
import { Button } from './Button.tsx';

interface RetroPongProps {
  settings: GameSettings;
  onUpdateSettings: (s: GameSettings) => void;
  onSettingsClick: () => void;
  isSettingsOpen: boolean;
}

export const RetroPong: React.FC<RetroPongProps> = ({ settings, onUpdateSettings, onSettingsClick, isSettingsOpen }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // Ref to track settings in game loop
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Demo Mode Timer
  const lastDemoSwitchRef = useRef<number>(0);

  // Input Optimization
  const boundsRef = useRef<{ left: number, top: number, width: number, height: number }>({ left: 0, top: 0, width: 0, height: 0 });
  
  // State & Refs
  const gameStateRef = useRef<GameState>(GameState.MENU);
  
  // Determine Logical Game Dimensions based on Orientation
  const isPortrait = settings.orientation === Orientation.PORTRAIT;
  const GAME_WIDTH = isPortrait ? BASE_HEIGHT : BASE_WIDTH;
  const GAME_HEIGHT = isPortrait ? BASE_WIDTH : BASE_HEIGHT;

  // Theme Colors
  const currentTheme = THEMES[settings.theme];
  const fgColor = currentTheme.FOREGROUND;

  const ballRef = useRef<BallState>({ x: GAME_WIDTH/2, y: GAME_HEIGHT/2, vx: 0, vy: 0, speed: INITIAL_BALL_SPEED, radius: BALL_RADIUS });
  const ballHistoryRef = useRef<{x: number, y: number}[]>([]);
  
  const playerRef = useRef<PaddleState>({ x: 0, y: 0, height: 0, width: 0, score: 0 });
  const aiRef = useRef<PaddleState>({ x: 0, y: 0, height: 0, width: 0, score: 0 });
  
  const mousePosRef = useRef<number>(isPortrait ? GAME_WIDTH/2 : GAME_HEIGHT/2); 
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const [uiState, setUiState] = useState<GameState>(GameState.MENU);
  const [winner, setWinner] = useState<'PLAYER' | 'AI' | null>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0 });

  // --- Game Logic ---

  const resetPaddles = useCallback(() => {
    const player = playerRef.current;
    const ai = aiRef.current;

    if (isPortrait) {
        player.width = PADDLE_LENGTH;
        player.height = PADDLE_THICKNESS;
        player.x = GAME_WIDTH / 2 - PADDLE_LENGTH / 2;
        player.y = GAME_HEIGHT - PADDLE_OFFSET - PADDLE_THICKNESS;

        ai.width = PADDLE_LENGTH;
        ai.height = PADDLE_THICKNESS;
        ai.x = GAME_WIDTH / 2 - PADDLE_LENGTH / 2;
        ai.y = PADDLE_OFFSET;
        
        mousePosRef.current = GAME_WIDTH / 2;
    } else {
        player.width = PADDLE_THICKNESS;
        player.height = PADDLE_LENGTH;
        player.x = PADDLE_OFFSET;
        player.y = GAME_HEIGHT / 2 - PADDLE_LENGTH / 2;

        ai.width = PADDLE_THICKNESS;
        ai.height = PADDLE_LENGTH;
        ai.x = GAME_WIDTH - PADDLE_OFFSET - PADDLE_THICKNESS;
        ai.y = GAME_HEIGHT / 2 - PADDLE_LENGTH / 2;

        mousePosRef.current = GAME_HEIGHT / 2;
    }
  }, [isPortrait, GAME_WIDTH, GAME_HEIGHT]);

  const resetBall = useCallback((scorer: 'PLAYER' | 'AI') => {
    const ball = ballRef.current;
    ball.x = GAME_WIDTH / 2;
    ball.y = GAME_HEIGHT / 2;
    ball.speed = INITIAL_BALL_SPEED;
    ballHistoryRef.current = [];
    
    if (isPortrait) {
        const direction = scorer === 'PLAYER' ? -1 : 1;
        ball.vy = direction * ball.speed;
        ball.vx = (Math.random() - 0.5) * ball.speed * 1.5;
    } else {
        const direction = scorer === 'PLAYER' ? 1 : -1;
        ball.vx = direction * ball.speed;
        ball.vy = (Math.random() - 0.5) * ball.speed * 1.5; 
    }
  }, [isPortrait, GAME_WIDTH, GAME_HEIGHT]);


  const updatePhysics = (timeScale: number) => {
    const currentSettings = settingsRef.current;
    const currentState = gameStateRef.current;
    
    if (currentState !== GameState.PLAYING && currentState !== GameState.MENU && currentState !== GameState.DEMO) return;

    const ball = ballRef.current;
    const player = playerRef.current;
    const ai = aiRef.current;
    const isMenu = currentState === GameState.MENU;
    const isDemo = currentState === GameState.DEMO;
    const speedMult = currentSettings.ballSpeedMultiplier;

    // --- DEMO MODE RANDOMIZER ---
    if (isDemo) {
        const now = Date.now();
        // Every 4 seconds, potentially switch effects
        if (now - lastDemoSwitchRef.current > 4000) {
            lastDemoSwitchRef.current = now;
            
            // Randomize Theme
            const themes = Object.values(Theme);
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            
            onUpdateSettings({
                ...currentSettings,
                theme: randomTheme,
                // Randomly toggle CRT effects for flavor
                crtEffect: Math.random() > 0.3, // 70% chance true
                fuzzyBackground: Math.random() > 0.5
            });
        }
    }

    // --- 1. MOVE PLAYER ---
    if (isDemo) {
         // AI Logic for Player in Demo Mode
         const lerpFactor = 0.10 * timeScale;
         if (isPortrait) {
             const pCenter = player.x + player.width / 2;
             player.x += (ball.x - pCenter) * lerpFactor;
             player.x = Math.max(0, Math.min(GAME_WIDTH - player.width, player.x));
         } else {
             const pCenter = player.y + player.height / 2;
             player.y += (ball.y - pCenter) * lerpFactor;
             player.y = Math.max(0, Math.min(GAME_HEIGHT - player.height, player.y));
         }
    } else {
        // Standard User Input
        let moveDelta = 0;
        const keyboardSpeed = 9 * timeScale; 
        
        if (keysPressed.current['ArrowUp'] || keysPressed.current['w']) moveDelta -= keyboardSpeed;
        if (keysPressed.current['ArrowDown'] || keysPressed.current['s']) moveDelta += keyboardSpeed;
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) moveDelta -= keyboardSpeed;
        if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) moveDelta += keyboardSpeed;

        if (isPortrait) {
            let xDelta = 0;
            if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) xDelta -= keyboardSpeed;
            if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) xDelta += keyboardSpeed;

            if (xDelta !== 0) {
                player.x += xDelta;
                mousePosRef.current = player.x + player.width / 2; 
            } else {
                const targetX = mousePosRef.current - player.width / 2;
                const lerpStrength = currentSettings.paddleSensitivity * timeScale;
                if (Math.abs(targetX - player.x) > 0.5) {
                player.x += (targetX - player.x) * lerpStrength;
                }
            }
            player.x = Math.max(0, Math.min(GAME_WIDTH - player.width, player.x));

        } else {
            let yDelta = 0;
            if (keysPressed.current['ArrowUp'] || keysPressed.current['w']) yDelta -= keyboardSpeed;
            if (keysPressed.current['ArrowDown'] || keysPressed.current['s']) yDelta += keyboardSpeed;

            if (yDelta !== 0) {
                player.y += yDelta;
                mousePosRef.current = player.y + player.height / 2;
            } else {
                const targetY = mousePosRef.current - player.height / 2;
                const lerpStrength = currentSettings.paddleSensitivity * timeScale;
                if (Math.abs(targetY - player.y) > 0.5) {
                player.y += (targetY - player.y) * lerpStrength;
                }
            }
            player.y = Math.max(0, Math.min(GAME_HEIGHT - player.height, player.y));
        }
    }

    // --- 2. MOVE AI ---
    const lerpFactor = (isMenu || isDemo) ? 0.15 * timeScale : AI_SPEED_FACTOR[currentSettings.difficulty] * timeScale;
    
    if (isPortrait) {
        const aiCenter = ai.x + ai.width / 2;
        const targetVal = ball.x;
        let error = 0;
        if (!isMenu && !isDemo && currentSettings.difficulty === Difficulty.EASY && ball.y > GAME_HEIGHT / 2) {
           error = Math.sin(Date.now() / 1000) * 60;
        }
        ai.x += ((targetVal + error) - aiCenter) * lerpFactor;
        ai.x = Math.max(0, Math.min(GAME_WIDTH - ai.width, ai.x));
    } else {
        const aiCenter = ai.y + ai.height / 2;
        const targetVal = ball.y;
        let error = 0;
        if (!isMenu && !isDemo && currentSettings.difficulty === Difficulty.EASY && ball.x < GAME_WIDTH / 2) {
          error = Math.sin(Date.now() / 1000) * 60; 
        }
        ai.y += ((targetVal + error) - aiCenter) * lerpFactor;
        ai.y = Math.max(0, Math.min(GAME_HEIGHT - ai.height, ai.y));
    }

    // --- 3. MOVE BALL & TRAIL ---
    
    if (currentSettings.trailLength > 0) {
        ballHistoryRef.current.push({ x: ball.x, y: ball.y });
        const maxHistory = Math.floor(currentSettings.trailLength * 60); 
        if (ballHistoryRef.current.length > maxHistory) {
            ballHistoryRef.current.shift();
        }
    } else {
        ballHistoryRef.current = [];
    }

    ball.x += ball.vx * timeScale * speedMult;
    ball.y += ball.vy * timeScale * speedMult;

    // --- 4. COLLISIONS ---
    const checkCollision = (paddle: PaddleState, isPlayer: boolean) => {
        const collisionBuffer = (25 * timeScale * speedMult); 

        if (isPortrait) {
            const paddleFace = isPlayer ? paddle.y : paddle.y + paddle.height;
            const movingTowards = isPlayer ? ball.vy > 0 : ball.vy < 0;
            
            if (!movingTowards) return;

            const hitWidth = ball.x >= paddle.x - 5 && ball.x <= paddle.x + paddle.width + 5;
            const dist = isPlayer ? paddleFace - (ball.y + ball.radius) : (ball.y - ball.radius) - paddleFace;

            if (hitWidth && dist <= 0 && dist > -collisionBuffer) {
                const intersectX = (ball.x - (paddle.x + paddle.width/2));
                const normalizedIntersect = intersectX / (paddle.width / 2);
                const bounceAngle = normalizedIntersect * (Math.PI / 3); 

                if (ball.speed < MAX_BALL_SPEED) ball.speed += SPEED_INCREMENT;

                const dirY = isPlayer ? -1 : 1;
                ball.vx = ball.speed * Math.sin(bounceAngle);
                ball.vy = dirY * ball.speed * Math.cos(bounceAngle);
                ball.y = isPlayer ? paddleFace - ball.radius - 1 : paddleFace + ball.radius + 1;
                
                if (!isMenu && !isDemo && currentSettings.soundEnabled) soundManager.playPaddleHit();
            }
        } else {
            const paddleFace = isPlayer ? paddle.x + paddle.width : paddle.x;
            const movingTowards = isPlayer ? ball.vx < 0 : ball.vx > 0;

            if (!movingTowards) return;

            const hitHeight = ball.y >= paddle.y - 5 && ball.y <= paddle.y + paddle.height + 5;
            const dist = isPlayer ? (ball.x - ball.radius) - paddleFace : paddleFace - (ball.x + ball.radius);
            
            if (hitHeight && dist <= 0 && dist > -collisionBuffer) {
                const intersectY = (ball.y - (paddle.y + paddle.height/2));
                const normalizedIntersect = intersectY / (paddle.height / 2);
                const bounceAngle = normalizedIntersect * (Math.PI / 4); 

                if (ball.speed < MAX_BALL_SPEED) ball.speed += SPEED_INCREMENT;

                const dirX = isPlayer ? 1 : -1;
                ball.vx = dirX * ball.speed * Math.cos(bounceAngle);
                ball.vy = ball.speed * Math.sin(bounceAngle);
                ball.x = isPlayer ? paddleFace + ball.radius + 1 : paddleFace - ball.radius - 1;

                if (!isMenu && !isDemo && currentSettings.soundEnabled) soundManager.playPaddleHit();
            }
        }
    };

    checkCollision(player, true);
    checkCollision(ai, false);

    // Wall Bounces
    if (isPortrait) {
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > GAME_WIDTH) {
            ball.vx = -ball.vx;
            ball.x = ball.x < GAME_WIDTH/2 ? ball.radius+1 : GAME_WIDTH-ball.radius-1;
            if (!isMenu && !isDemo && currentSettings.soundEnabled) soundManager.playWallHit();
        }
    } else {
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > GAME_HEIGHT) {
            ball.vy = -ball.vy;
            ball.y = ball.y < GAME_HEIGHT/2 ? ball.radius+1 : GAME_HEIGHT-ball.radius-1;
            if (!isMenu && !isDemo && currentSettings.soundEnabled) soundManager.playWallHit();
        }
    }

    // Scoring
    const handleScoring = (scorer: 'PLAYER' | 'AI') => {
        if (isMenu || isDemo) {
            resetBall(scorer === 'PLAYER' ? 'AI' : 'PLAYER');
        } else {
             if (scorer === 'PLAYER') {
                 player.score++;
                 if (currentSettings.soundEnabled) soundManager.playScore();
             } else {
                 ai.score++;
                 if (currentSettings.soundEnabled) soundManager.playLoss();
             }
             
             handleScoreUpdate();
             
             if ((scorer === 'PLAYER' ? player.score : ai.score) >= currentSettings.winningScore) {
                 handleGameOver(scorer);
             } else {
                 resetBall(scorer);
             }
        }
    };

    if (isPortrait) {
        if (ball.y < 0) handleScoring('PLAYER'); 
        else if (ball.y > GAME_HEIGHT) handleScoring('AI');
    } else {
        if (ball.x < 0) handleScoring('AI');
        else if (ball.x > GAME_WIDTH) handleScoring('PLAYER');
    }
  };

  const handleScoreUpdate = () => {
    setScores({ player: playerRef.current.score, ai: aiRef.current.score });
  };

  const handleGameOver = (winner: 'PLAYER' | 'AI') => {
    gameStateRef.current = GameState.GAME_OVER;
    setUiState(GameState.GAME_OVER);
    setWinner(winner);
  };

  // --- Rendering ---

  const draw = (ctx: CanvasRenderingContext2D) => {
    const currentSettings = settingsRef.current;
    // Draw Background
    ctx.fillStyle = currentTheme.BACKGROUND;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw Grid (Retro Effect)
    ctx.strokeStyle = currentTheme.DIM;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const gridSize = 40;
    for (let x = 0; x <= GAME_WIDTH; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, GAME_HEIGHT); }
    for (let y = 0; y <= GAME_HEIGHT; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(GAME_WIDTH, y); }
    ctx.stroke();

    // Net
    ctx.strokeStyle = currentTheme.ACCENT;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    if (isPortrait) {
        ctx.moveTo(0, GAME_HEIGHT / 2);
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT / 2);
    } else {
        ctx.moveTo(GAME_WIDTH / 2, 0);
        ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Entities with slight glow for CRT effect if enabled
    // Glow enabled if Scanlines (CRT) are on, gives it that phosphor look
    ctx.shadowBlur = (currentSettings.crtEffect) ? 10 : 0;
    ctx.shadowColor = fgColor;
    ctx.fillStyle = fgColor;

    // Player
    ctx.fillRect(playerRef.current.x, playerRef.current.y, playerRef.current.width, playerRef.current.height);
    // AI
    ctx.fillRect(aiRef.current.x, aiRef.current.y, aiRef.current.width, aiRef.current.height);

    // Ball Trails
    if (currentSettings.trailLength > 0 && ballHistoryRef.current.length > 0) {
        const hist = ballHistoryRef.current;
        for (let i = 0; i < hist.length; i++) {
            const pos = hist[i];
            const alpha = ((i / hist.length) * 0.7) + 0.1; 
            ctx.globalAlpha = alpha;
            const r = ballRef.current.radius;
            ctx.fillRect(pos.x - r, pos.y - r, r * 2, r * 2);
        }
        ctx.globalAlpha = 1.0;
    }

    // Ball
    ctx.fillRect(ballRef.current.x - ballRef.current.radius, ballRef.current.y - ballRef.current.radius, ballRef.current.radius * 2, ballRef.current.radius * 2);

    ctx.shadowBlur = 0;
  };

  const gameLoop = (time: number) => {
    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;
    const safeDt = Math.min(dt, 100); 
    const timeScale = safeDt / (1000 / 60);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        updatePhysics(timeScale);
        draw(ctx);
      }
    }
    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  // --- Handlers ---

  const startGame = () => {
    playerRef.current.score = 0;
    aiRef.current.score = 0;
    setScores({ player: 0, ai: 0 });
    resetPaddles();
    resetBall('PLAYER'); 
    if (isPortrait) ballRef.current.vy = -INITIAL_BALL_SPEED;
    else ballRef.current.vx = -INITIAL_BALL_SPEED;
    gameStateRef.current = GameState.PLAYING;
    setUiState(GameState.PLAYING);
    lastTimeRef.current = performance.now();
    soundManager.setEnabled(settings.soundEnabled);
  };

  const startDemo = () => {
    lastDemoSwitchRef.current = Date.now();
    resetPaddles();
    resetBall('PLAYER');
    gameStateRef.current = GameState.DEMO;
    setUiState(GameState.DEMO);
    lastTimeRef.current = performance.now();
  };

  const quitGame = () => {
    gameStateRef.current = GameState.MENU;
    setUiState(GameState.MENU);
    keysPressed.current = {};
    resetPaddles();
    resetBall('PLAYER');
    ballHistoryRef.current = [];
    if (isPortrait) ballRef.current.vy = -INITIAL_BALL_SPEED;
    else ballRef.current.vx = -INITIAL_BALL_SPEED;
  };

  const resumeGame = () => {
    gameStateRef.current = GameState.PLAYING;
    setUiState(GameState.PLAYING);
    lastTimeRef.current = performance.now();
  };

  useEffect(() => {
    resetPaddles();
    resetBall('PLAYER');
    if (isPortrait) ballRef.current.vy = -INITIAL_BALL_SPEED;
    else ballRef.current.vx = -INITIAL_BALL_SPEED;

    const handleMouseMove = (e: MouseEvent) => {
        // Removed auto-quit for demo on move
        if (gameStateRef.current === GameState.DEMO) return;

        if (gameStateRef.current !== GameState.PLAYING && gameStateRef.current !== GameState.MENU) return;
        
        const { left, top, width, height } = boundsRef.current;
        if (width <= 0 || height <= 0) return;

        if (isPortrait) {
            const scaleX = GAME_WIDTH / width;
            const newX = (e.clientX - left) * scaleX;
            mousePosRef.current = Math.max(0, Math.min(GAME_WIDTH, newX));
        } else {
            const scaleY = GAME_HEIGHT / height;
            const newY = (e.clientY - top) * scaleY;
            mousePosRef.current = Math.max(0, Math.min(GAME_HEIGHT, newY));
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        // Removed auto-quit for demo on touch move
        if (gameStateRef.current === GameState.DEMO) return;

        if (gameStateRef.current !== GameState.PLAYING && gameStateRef.current !== GameState.MENU) return;
        e.preventDefault();
        const { left, top, width, height } = boundsRef.current;
        if (width > 0 && height > 0 && e.touches.length > 0) {
            if (isPortrait) {
                const scaleX = GAME_WIDTH / width;
                const newX = (e.touches[0].clientX - left) * scaleX;
                mousePosRef.current = Math.max(0, Math.min(GAME_WIDTH, newX));
            } else {
                const scaleY = GAME_HEIGHT / height;
                const newY = (e.touches[0].clientY - top) * scaleY;
                mousePosRef.current = Math.max(0, Math.min(GAME_HEIGHT, newY));
            }
        }
    };

    // Explicit Click Handler to exit Demo
    const handleMouseDown = () => {
        if (gameStateRef.current === GameState.DEMO) {
            quitGame();
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current === GameState.DEMO) {
          quitGame();
          return;
      }
      keysPressed.current[e.key] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameStateRef.current === GameState.PLAYING) {
          gameStateRef.current = GameState.PAUSED;
          setUiState(GameState.PAUSED);
        } else if (gameStateRef.current === GameState.PAUSED) {
          resumeGame();
        }
      }
      if (e.code === 'Escape') {
        if (gameStateRef.current === GameState.PLAYING || gameStateRef.current === GameState.PAUSED) {
          quitGame();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    lastTimeRef.current = performance.now();
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [settings.orientation, GAME_WIDTH, GAME_HEIGHT, settings.theme]);

  useEffect(() => {
      soundManager.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Responsive Scaling
  const [displaySize, setDisplaySize] = useState({ width: GAME_WIDTH, height: GAME_HEIGHT });
  useEffect(() => {
      const updateSize = () => {
          if (containerRef.current && canvasRef.current) {
             const { clientWidth, clientHeight } = containerRef.current;
             const aspect = GAME_WIDTH / GAME_HEIGHT;
             let w = clientWidth;
             let h = w / aspect;
             if (h > clientHeight) { h = clientHeight; w = h * aspect; }
             setDisplaySize({ width: w, height: h });
             setTimeout(() => {
                 if (canvasRef.current) {
                     const rect = canvasRef.current.getBoundingClientRect();
                     boundsRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
                 }
             }, 50);
          }
      };
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
  }, [GAME_WIDTH, GAME_HEIGHT]);

  const showMenuOverlay = uiState === GameState.MENU && !isSettingsOpen;
  const showPauseOverlay = uiState === GameState.PAUSED && !isSettingsOpen;
  const showGameOverOverlay = uiState === GameState.GAME_OVER && !isSettingsOpen;
  const isDemo = uiState === GameState.DEMO;

  // Logic to select text classes based on settings.textSize
  const getTextClasses = (size: TextSize) => {
    switch(size) {
      case TextSize.LARGE:
        return {
           title: "text-8xl md:text-[10rem]",
           score: "text-8xl md:text-9xl",
           goal: "text-4xl md:text-5xl",
           instruction: "text-2xl md:text-4xl",
           sub: "text-4xl md:text-5xl",
           btn: "lg",
           btnText: "text-4xl py-6"
        };
      case TextSize.MEDIUM:
        return {
           title: "text-7xl md:text-9xl",
           score: "text-7xl md:text-8xl",
           goal: "text-3xl md:text-4xl",
           instruction: "text-xl md:text-3xl",
           sub: "text-3xl md:text-4xl",
           btn: "lg",
           btnText: "text-2xl py-4"
        };
      default: // SMALL
        return {
           title: "text-6xl md:text-8xl",
           score: "text-6xl",
           goal: "text-2xl",
           instruction: "text-xs md:text-sm",
           sub: "text-xl",
           btn: "md",
           btnText: ""
        };
    }
  };

  const t = getTextClasses(settings.textSize);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: currentTheme.BACKGROUND, color: fgColor }}>
      
      {/* Scoreboard - Hidden in Demo */}
      {uiState !== GameState.MENU && !isDemo && (
         <div className={`absolute ${isPortrait ? 'top-1/2 right-4 -translate-y-1/2 flex-col gap-8' : 'top-4 w-full justify-between px-12'} flex pointer-events-none z-10 select-none items-center font-mono`}>
            {isPortrait ? (
                <>
                  <div className={`${t.score} font-bold drop-shadow-md`}>{scores.ai}</div>
                  <div className={`${t.instruction} opacity-50 rotate-90 whitespace-nowrap tracking-widest`}>GOAL: {settings.winningScore}</div>
                  <div className={`${t.score} font-bold drop-shadow-md`}>{scores.player}</div>
                </>
            ) : (
                <>
                   <div className={`${t.score} font-bold drop-shadow-md`}>{scores.player}</div>
                   <div className={`${t.goal} mt-4 opacity-50 tracking-widest`}>GOAL: {settings.winningScore}</div>
                   <div className={`${t.score} font-bold drop-shadow-md`}>{scores.ai}</div>
                </>
            )}
         </div>
      )}

      {/* Demo Overlay */}
      {isDemo && (
         <div className="absolute top-8 w-full text-center z-10 animate-pulse">
             <h2 className={`${t.title} font-bold tracking-widest opacity-50`}>DEMO MODE</h2>
             <p className={`${t.instruction} mt-2 uppercase`}>CLICK OR PRESS ANY KEY TO EXIT</p>
         </div>
      )}

      {/* Instructions */}
      {uiState === GameState.PLAYING && (
         <div className={`absolute bottom-4 right-6 opacity-50 ${t.instruction} font-mono select-none pointer-events-none uppercase tracking-widest z-10`}>
             SPACE: PAUSE / ESC: QUIT
         </div>
      )}

      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ width: displaySize.width, height: displaySize.height, boxShadow: `0 0 20px ${currentTheme.DIM}` }}
        className="border-2 border-current rounded-sm cursor-none touch-none"
      />

      {/* MENU */}
      {showMenuOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
          <h1 className={`${t.title} font-bold mb-4 text-center px-4 uppercase tracking-widest drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]`} style={{ textShadow: `4px 4px 0 ${currentTheme.DIM}` }}>
            RETRO PONG
          </h1>
          <p className={`mb-12 tracking-[0.5em] text-center ${t.instruction} uppercase animate-pulse`}>INSERT COIN OR CLICK START</p>
          
          <div className={`flex flex-col gap-6 ${settings.textSize !== TextSize.SMALL ? 'w-full max-w-2xl px-8' : 'w-64'}`}>
            <Button onClick={startGame} size={t.btn as any} themeColor={fgColor} className={t.btnText}>START SYSTEM</Button>
            
            {/* Demo Button */}
            <Button onClick={startDemo} variant="secondary" size={t.btn as any} themeColor={fgColor} className={`${t.btnText} opacity-50 hover:opacity-100`}>
                DEMO MODE
            </Button>

            <Button onClick={onSettingsClick} variant="secondary" size={t.btn as any} themeColor={fgColor} className={t.btnText}>CONFIG</Button>
          </div>
        </div>
      )}

      {/* PAUSE */}
      {showPauseOverlay && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
          <h2 className={`${settings.textSize !== TextSize.SMALL ? 'text-9xl' : 'text-5xl'} mb-8 font-bold tracking-widest border-b-4 pb-2 blink`}>PAUSED</h2>
          <div className={`flex flex-col gap-6 ${settings.textSize !== TextSize.SMALL ? 'w-full max-w-2xl px-8' : 'w-64'}`}>
            <Button onClick={resumeGame} variant="outline" size={t.btn as any} themeColor={fgColor} className={t.btnText}>RESUME</Button>
            <Button onClick={onSettingsClick} variant="secondary" size={t.btn as any} themeColor={fgColor} className={t.btnText}>CONFIG</Button>
            <Button onClick={quitGame} variant="danger" size={t.btn as any} themeColor={fgColor} className={t.btnText}>ABORT</Button>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {showGameOverOverlay && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
          <h2 className={`${settings.textSize !== TextSize.SMALL ? 'text-9xl' : 'text-6xl'} mb-4 font-bold uppercase tracking-tighter drop-shadow-md`}>
            {winner === 'PLAYER' ? 'YOU WIN' : 'GAME OVER'}
          </h2>
          <p className={`${t.sub} mb-8 text-center px-4 font-mono`}>
            {winner === 'PLAYER' ? 'HIGH SCORE ACHIEVED' : 'INSERT COIN TO CONTINUE'}
          </p>
          <div className={`flex gap-6 ${settings.textSize !== TextSize.SMALL ? 'flex-col w-full max-w-xl' : ''}`}>
             <Button onClick={startGame} size={t.btn as any} themeColor={fgColor} className={t.btnText}>RETRY</Button>
             <Button onClick={quitGame} variant="secondary" size={t.btn as any} themeColor={fgColor} className={t.btnText}>EXIT</Button>
          </div>
        </div>
      )}
    </div>
  );
};