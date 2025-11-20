
import React, { useState } from 'react';
import { RetroPong } from './components/NeonPong.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { GameSettings, Difficulty, Orientation, Theme, TextSize } from './types.ts';

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    difficulty: Difficulty.MEDIUM,
    winningScore: 10,
    ballSpeedMultiplier: 1.0,
    paddleSensitivity: 0.14,
    orientation: Orientation.LANDSCAPE,
    theme: Theme.CLASSIC,
    effectsEnabled: true, // Controls Screen Warp/Distortion only
    crtEffect: true,      // Controls Scanlines/Vignette
    fuzzyBackground: false, // Controls Static Noise
    glitchEffect: false,
    trailLength: 0.5, 
    textSize: TextSize.SMALL
  });

  // Class composition for visual effects
  // crtEffect controls the overlay mesh and vignette
  const crtClasses = settings.crtEffect ? 'crt-overlay' : '';
  
  // effectsEnabled strictly controls the warp/distortion animation classes
  // It does NOT remove the CRT overlay or noise
  const warpClasses = settings.effectsEnabled 
    ? (settings.glitchEffect ? 'glitch-active' : 'distortion-active') 
    : '';
    
  // fuzzyBackground controls the noise layer
  const noiseVisible = settings.fuzzyBackground;

  return (
    <div className={`w-full h-full crt-container ${crtClasses} ${warpClasses}`}>
      {/* FX Layers */}
      {settings.crtEffect && <div className="vignette crt-flicker"></div>}
      {noiseVisible && <div className="noise"></div>}
      
      <div className="relative z-10 w-full h-full">
        <RetroPong 
          settings={settings} 
          onUpdateSettings={setSettings}
          onSettingsClick={() => setIsSettingsOpen(true)}
          isSettingsOpen={isSettingsOpen}
        />
        
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      </div>
    </div>
  );
};

export default App;