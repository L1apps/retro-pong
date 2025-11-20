
import React from 'react';
import { GameSettings, Difficulty, Orientation, Theme, TextSize } from '../types.ts';
import { WINNING_SCORE_OPTIONS, THEMES } from '../constants.ts';
import { Button } from './Button.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings 
}) => {
  if (!isOpen) return null;

  const currentTheme = THEMES[settings.theme];
  const fg = currentTheme.FOREGROUND;
  const dim = currentTheme.DIM;

  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  // Dynamic sizing for Settings Modal
  const getModalTextClasses = (size: TextSize) => {
    switch(size) {
      case TextSize.LARGE:
        return {
          header: "text-5xl md:text-7xl",
          label: "text-3xl md:text-4xl",
          btnText: "text-2xl md:text-3xl",
          option: "text-2xl md:text-3xl",
          mono: "text-2xl md:text-3xl",
          close: "text-4xl md:text-6xl",
          spacing: "space-y-10"
        };
      case TextSize.MEDIUM:
        return {
          header: "text-4xl md:text-6xl",
          label: "text-xl md:text-2xl",
          btnText: "text-lg md:text-xl",
          option: "text-lg md:text-xl",
          mono: "text-lg md:text-xl",
          close: "text-3xl md:text-5xl",
          spacing: "space-y-9"
        };
      default: // SMALL
        return {
          header: "text-3xl",
          label: "text-sm",
          btnText: "text-sm",
          option: "text-sm",
          mono: "text-sm",
          close: "text-xl",
          spacing: "space-y-8"
        };
    }
  };

  const t = getModalTextClasses(settings.textSize);

  // Helper for Slider
  const textSizeValues = [TextSize.SMALL, TextSize.MEDIUM, TextSize.LARGE];
  const currentTextSizeIndex = textSizeValues.indexOf(settings.textSize);
  const handleTextSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const index = parseInt(e.target.value);
      handleChange('textSize', textSizeValues[index]);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
      <div 
        className={`border-4 p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto shadow-[10px_10px_0px_0px_rgba(30,30,30,1)]`}
        style={{ 
          backgroundColor: currentTheme.BACKGROUND, 
          borderColor: fg,
          color: fg,
          boxShadow: `10px 10px 0px 0px ${dim}`
        }}
      >
        {/* Header Row with Flexbox to prevent overlap */}
        <div className="flex justify-between items-start mb-8 border-b-2 pb-2" style={{ borderColor: dim }}>
            <h2 className={`${t.header} font-bold tracking-widest leading-none break-words mr-4`}>
              SYSTEM.CONFIG
            </h2>
            <button 
              onClick={onClose}
              className={`${t.close} font-bold hover:opacity-70 leading-none shrink-0`}
              style={{ color: fg }}
            >
              [X]
            </button>
        </div>

        <div className={t.spacing}>
          
          {/* Visual Theme */}
          <div>
            <label className={`block ${t.label} mb-2 font-bold uppercase tracking-widest opacity-70`}>Monitor Theme</label>
            <div className="flex gap-2">
              {(Object.keys(Theme) as Array<keyof typeof Theme>).map((tVal) => (
                <button
                  key={tVal}
                  onClick={() => handleChange('theme', Theme[tVal])}
                  className={`flex-1 py-2 ${t.btnText} font-bold border-2 transition-all uppercase ${
                    settings.theme === Theme[tVal] ? 'text-black' : 'bg-transparent'
                  }`}
                  style={{ 
                    borderColor: fg,
                    backgroundColor: settings.theme === Theme[tVal] ? fg : 'transparent',
                    color: settings.theme === Theme[tVal] ? currentTheme.BACKGROUND : fg
                  }}
                >
                  {tVal}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Effects - Flattened List */}
          <div>
            <div className="flex items-center justify-between mb-2">
               <label className={`${t.label} font-bold uppercase tracking-widest opacity-70`}>Visual FX</label>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {/* Scanlines */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`${settings.textSize !== TextSize.SMALL ? 'w-8 h-8' : 'w-5 h-5'} border-2 flex items-center justify-center ${settings.crtEffect ? 'bg-transparent' : ''}`} style={{ borderColor: fg }}>
                         {settings.crtEffect && <div className={`${settings.textSize !== TextSize.SMALL ? 'w-6 h-6' : 'w-3 h-3'}`} style={{ backgroundColor: fg }}></div>}
                    </div>
                    <input type="checkbox" className="hidden" checked={settings.crtEffect} onChange={(e) => handleChange('crtEffect', e.target.checked)} />
                    <span className={`${t.option} font-bold group-hover:opacity-100 opacity-80`}>SCANLINES</span>
                </label>
                
                {/* Static Noise */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`${settings.textSize !== TextSize.SMALL ? 'w-8 h-8' : 'w-5 h-5'} border-2 flex items-center justify-center ${settings.fuzzyBackground ? 'bg-transparent' : ''}`} style={{ borderColor: fg }}>
                         {settings.fuzzyBackground && <div className={`${settings.textSize !== TextSize.SMALL ? 'w-6 h-6' : 'w-3 h-3'}`} style={{ backgroundColor: fg }}></div>}
                    </div>
                    <input type="checkbox" className="hidden" checked={settings.fuzzyBackground} onChange={(e) => handleChange('fuzzyBackground', e.target.checked)} />
                    <span className={`${t.option} font-bold group-hover:opacity-100 opacity-80`}>STATIC NOISE</span>
                </label>

                {/* Screen Warp - Controlled by effectsEnabled */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`${settings.textSize !== TextSize.SMALL ? 'w-8 h-8' : 'w-5 h-5'} border-2 flex items-center justify-center ${settings.effectsEnabled ? 'bg-transparent' : ''}`} style={{ borderColor: fg }}>
                         {settings.effectsEnabled && <div className={`${settings.textSize !== TextSize.SMALL ? 'w-6 h-6' : 'w-3 h-3'}`} style={{ backgroundColor: fg }}></div>}
                    </div>
                    <input type="checkbox" className="hidden" checked={settings.effectsEnabled} onChange={(e) => handleChange('effectsEnabled', e.target.checked)} />
                    <span className={`${t.option} font-bold group-hover:opacity-100 opacity-80`}>SCREEN WARP</span>
                </label>
            </div>
          </div>

           {/* Trail Length */}
           <div>
             <div className="flex justify-between mb-1">
               <label className={`${t.label} font-bold uppercase tracking-widest opacity-70`}>Ball Trails</label>
               <span className={`${t.mono} font-mono`}>
                 {settings.trailLength <= 0 ? 'OFF' : `${(settings.trailLength * 100).toFixed(0)}%`}
               </span>
             </div>
             <input 
               type="range" 
               min="0.0" 
               max="1.0" 
               step="0.1"
               value={settings.trailLength}
               onChange={(e) => handleChange('trailLength', parseFloat(e.target.value))}
               className="w-full h-2 appearance-none cursor-pointer opacity-80 hover:opacity-100"
               style={{ background: dim }}
             />
          </div>

          {/* Text Size Slider */}
          <div>
             <div className="flex justify-between mb-1">
               <label className={`${t.label} font-bold uppercase tracking-widest opacity-70`}>Text Size</label>
               <span className={`${t.mono} font-mono uppercase`}>
                 {settings.textSize}
               </span>
             </div>
             <div className="relative pt-1">
                <input 
                type="range" 
                min="0" 
                max="2" 
                step="1"
                value={currentTextSizeIndex}
                onChange={handleTextSizeChange}
                className="w-full h-2 appearance-none cursor-pointer opacity-80 hover:opacity-100 z-20 relative"
                style={{ background: dim }}
                />
                <div className="flex justify-between w-full px-1 mt-1 text-xs opacity-50 font-mono">
                    <span>S</span>
                    <span>M</span>
                    <span>L</span>
                </div>
             </div>
          </div>

          {/* Orientation */}
           <div>
            <label className={`block ${t.label} mb-2 font-bold uppercase tracking-widest opacity-70`}>Board Orientation</label>
            <div className="flex border-2" style={{ borderColor: dim }}>
              {(Object.keys(Orientation) as Array<keyof typeof Orientation>).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleChange('orientation', Orientation[mode])}
                  className={`flex-1 py-2 ${t.btnText} font-bold transition-all uppercase`}
                  style={{ 
                    backgroundColor: settings.orientation === Orientation[mode] ? fg : 'transparent',
                    color: settings.orientation === Orientation[mode] ? currentTheme.BACKGROUND : fg
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className={`block ${t.label} mb-2 font-bold uppercase tracking-widest opacity-70`}>Difficulty</label>
            <div className="flex border-2" style={{ borderColor: dim }}>
              {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map((level) => (
                <button
                  key={level}
                  onClick={() => handleChange('difficulty', Difficulty[level])}
                  className={`flex-1 py-2 ${t.btnText} font-bold transition-all uppercase`}
                  style={{ 
                    backgroundColor: settings.difficulty === Difficulty[level] ? fg : 'transparent',
                    color: settings.difficulty === Difficulty[level] ? currentTheme.BACKGROUND : fg
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Ball Speed Multiplier */}
          <div>
             <div className="flex justify-between mb-1">
               <label className={`${t.label} font-bold uppercase tracking-widest opacity-70`}>Ball Speed</label>
               <span className={`${t.mono} font-mono`}>{(settings.ballSpeedMultiplier * 100).toFixed(0)}%</span>
             </div>
             <input 
               type="range" 
               min="0.5" 
               max="2.0" 
               step="0.1"
               value={settings.ballSpeedMultiplier}
               onChange={(e) => handleChange('ballSpeedMultiplier', parseFloat(e.target.value))}
               className="w-full h-2 appearance-none cursor-pointer opacity-80 hover:opacity-100"
               style={{ background: dim }}
             />
          </div>

          {/* Paddle Sensitivity */}
          <div>
             <div className="flex justify-between mb-1">
               <label className={`${t.label} font-bold uppercase tracking-widest opacity-70`}>Paddle Control</label>
               <span className={`${t.mono} font-mono`}>
                 {settings.paddleSensitivity < 0.1 ? 'HEAVY' : settings.paddleSensitivity > 0.3 ? 'INSTANT' : 'SMOOTH'}
               </span>
             </div>
             <input 
               type="range" 
               min="0.02" 
               max="0.5" 
               step="0.02"
               value={settings.paddleSensitivity}
               onChange={(e) => handleChange('paddleSensitivity', parseFloat(e.target.value))}
               className="w-full h-2 appearance-none cursor-pointer opacity-80 hover:opacity-100"
               style={{ background: dim }}
             />
          </div>

          {/* Score Limit */}
          <div>
             <label className={`block ${t.label} mb-2 font-bold uppercase tracking-widest opacity-70`}>Target Score</label>
             <div className="flex gap-2">
                {WINNING_SCORE_OPTIONS.map(score => (
                  <button
                    key={score}
                    onClick={() => handleChange('winningScore', score)}
                    className={`flex-1 py-2 border-2 font-mono ${t.btnText} font-bold`}
                    style={{ 
                        borderColor: settings.winningScore === score ? fg : dim,
                        backgroundColor: settings.winningScore === score ? fg : 'transparent',
                        color: settings.winningScore === score ? currentTheme.BACKGROUND : fg
                    }}
                  >
                    {score}
                  </button>
                ))}
             </div>
          </div>

          {/* Audio Toggle */}
          <div className="flex items-center justify-between pt-2 border-t-2" style={{ borderColor: dim }}>
            <span className={`${t.label} font-bold`}>AUDIO</span>
            <button
              onClick={() => handleChange('soundEnabled', !settings.soundEnabled)}
              className={`font-bold ${t.btnText} uppercase`}
            >
              [{settings.soundEnabled ? 'ON' : 'OFF'}]
            </button>
          </div>

        </div>

        <div className="mt-8 pt-4 border-t-2" style={{ borderColor: dim }}>
           <Button onClick={onClose} className="w-full" themeColor={fg} size={settings.textSize !== TextSize.SMALL ? "lg" : "md"}>RETURN</Button>
        </div>

      </div>
    </div>
  );
};