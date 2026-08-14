import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, ArrowRight, ArrowDown, ArrowLeft, ArrowUp, Sword } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";

interface WallSetupProps {
  dealerWind: string;
  onComplete: () => void;
}

export const WallSetup: React.FC<WallSetupProps> = ({ dealerWind, onComplete }) => {
  const { t } = useLanguage();
  const [dice1, setDice1] = useState<number>(0);
  const [dice2, setDice2] = useState<number>(0);
  const [rolling, setRolling] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const rollDice = () => {
    setRolling(true);
    setShowAnimation(false);
    let rolls = 0;
    const interval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 15) {
        clearInterval(interval);
        setRolling(false);
        setTimeout(() => setShowAnimation(true), 500);
      }
    }, 100);
  };

  const getDiceIcon = (val: number) => {
    switch (val) {
      case 1: return <Dice1 size={32} />;
      case 2: return <Dice2 size={32} />;
      case 3: return <Dice3 size={32} />;
      case 4: return <Dice4 size={32} />;
      case 5: return <Dice5 size={32} />;
      case 6: return <Dice6 size={32} />;
      default: return <Dice1 size={32} />;
    }
  };

  const sum = dice1 + dice2;

  // 1 = Bottom (Dealer), 2 = Right, 3 = Top (Across), 0 = Left.
  const brokenWallIndex = sum > 0 ? (sum % 4) : -1;
  const targetWall = brokenWallIndex === 1 ? 0 : brokenWallIndex === 2 ? 1 : brokenWallIndex === 3 ? 2 : 3;

  const getStackIdx = (wallPos: number, index: number) => {
    if (wallPos === 0) return 16 - index; // East: right-to-left
    if (wallPos === 1) return index;      // South: top-to-bottom
    if (wallPos === 2) return 16 - index; // West: visually left-to-right (due to rotate-180)
    if (wallPos === 3) return index;      // North: visually bottom-to-top (due to rotate-180)
    return index;
  };

  const getCWGlobalIdx = (wallPos: number, stackIdx: number) => {
    if (wallPos === 0) return stackIdx;
    if (wallPos === 3) return 17 + stackIdx;
    if (wallPos === 2) return 34 + stackIdx;
    if (wallPos === 1) return 51 + stackIdx;
    return 0;
  };

  const breakCWGlobal = sum > 0 ? getCWGlobalIdx(targetWall, sum) : 0;

  const renderWall = (wallPosition: number) => {
    // Each wall has 17 stacks (pairs of tiles)
    const stacks = Array.from({ length: 17 });
    
    return (
      <div className={`flex ${wallPosition % 2 === 1 ? 'flex-col' : 'flex-row'} items-center justify-center relative`}>
        {stacks.map((_, i) => {
          const stackIdx = getStackIdx(wallPosition, i);
          const cwGlobal = getCWGlobalIdx(wallPosition, stackIdx);
          
          let isDeadWall = false;
          if (showAnimation) {
            const diff = (breakCWGlobal - cwGlobal + 68) % 68;
            isDeadWall = diff > 0 && diff <= 7;
          }
          
          let addBreakSpace = false;
          if (showAnimation && wallPosition === targetWall) {
            if (wallPosition === 0 || wallPosition === 2) {
              addBreakSpace = stackIdx === sum;
            } else {
              addBreakSpace = stackIdx === sum - 1;
            }
          }
          
          return (
            <React.Fragment key={i}>
              <div 
                className={`
                  ${wallPosition % 2 === 1 ? 'w-8 h-4 mb-0.5' : 'w-4 h-8 mr-0.5'} 
                  border border-gray-400 rounded-sm shadow-sm
                  ${isDeadWall ? 'bg-gray-400' : 'bg-amber-100'}
                  transition-all duration-500
                `}
              />
              {addBreakSpace && (
                <div className={`flex items-center justify-center ${wallPosition % 2 === 1 ? 'h-12 w-full my-2' : 'w-12 h-full mx-2'} ${wallPosition >= 2 ? 'rotate-180' : ''}`}>
                  <div className="font-bold text-red-500 text-lg bg-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-red-500 z-10 shadow-md">
                    <Sword size={18} />
                  </div>
                  {/* Arrow for drawing direction (clockwise) */}
                  <div className="absolute opacity-80 animate-pulse text-blue-600">
                    {wallPosition === 0 && <ArrowLeft size={32} className="ml-16 mt-12" />}
                    {wallPosition === 1 && <ArrowDown size={32} className="mt-16 mr-12" />}
                    {wallPosition === 2 && <ArrowRight size={32} className="mr-16 mb-12" />}
                    {wallPosition === 3 && <ArrowUp size={32} className="mb-16 ml-12" />}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-6 bg-card text-card-foreground rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border">
      <h2 className="text-2xl font-bold mb-2">{t("wallSetupTitle")}</h2>
      <p className="mb-6 text-muted-foreground">{t("dealerIsAt")} {dealerWind.toUpperCase()}</p>
      
      {/* Table Top View */}
      <div className="relative w-[500px] h-[500px] bg-green-700 rounded-xl p-8 shadow-inner flex items-center justify-center mb-8 border-8 border-green-800">
        
        {/* Top Wall */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 rotate-180">
          {renderWall(2)}
        </div>
        
        {/* Right Wall */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {renderWall(1)}
        </div>
        
        {/* Bottom Wall (Dealer) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          {renderWall(0)}
        </div>
        
        {/* Left Wall */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 rotate-180">
          {renderWall(3)}
        </div>

        {/* Center Area */}
        <div className="w-48 h-48 bg-green-600 rounded-lg flex flex-col items-center justify-center shadow-lg border border-green-500">
          <div className="flex justify-center space-x-4 mb-4">
            <div className={`p-3 bg-white rounded-lg text-black shadow ${rolling ? 'animate-spin' : ''}`}>
              {dice1 > 0 ? getDiceIcon(dice1) : <Dice1 size={32} className="opacity-30" />}
            </div>
            <div className={`p-3 bg-white rounded-lg text-black shadow ${rolling ? 'animate-spin delay-75' : ''}`}>
              {dice2 > 0 ? getDiceIcon(dice2) : <Dice1 size={32} className="opacity-30" />}
            </div>
          </div>
          {dice1 > 0 && (
            <div className="text-white text-xl font-bold">
              {t("diceResult")}: {sum}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 text-center">
        {!rolling && dice1 > 0 && showAnimation && (
          <div className="bg-card text-foreground p-4 rounded-lg text-sm border border-border shadow-md">
            <p><strong>{t("deadWall")}</strong>: {t("highlightedInGray")}</p>
            <p><strong>{t("drawingDirection")}</strong>: {t("indicatedByArrow")}</p>
          </div>
        )}

        {dice1 === 0 ? (
          <Button onClick={rollDice} disabled={rolling} size="lg" variant="default" className="w-full">
            {rolling ? "..." : t("rollDice")}
          </Button>
        ) : (
          <Button onClick={onComplete} disabled={rolling || !showAnimation} size="lg" variant="secondary" className="w-full shadow-sm hover:shadow-md">
            {t("continue")}
          </Button>
        )}
      </div>
    </div>
  );
};
