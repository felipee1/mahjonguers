import greenDragon from "@/assets/green-dragon.png";
import redDragon from "@/assets/red-dragon.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Play, Trophy } from "lucide-react";
import React from "react";

interface MainMenuProps {
  onNewGame: () => void;
  onHistory: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onHistory }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen chinese-pattern flex items-center justify-center p-4 relative overflow-hidden">
      <Card className="w-full max-w-md p-8 shadow-elegant border-border/50 bg-card/95 backdrop-blur-sm relative z-10">
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-4">
              <img
                src={greenDragon}
                alt="Green Dragon"
                className="w-12 h-12 opacity-60  rotate-left-on-float"
              />
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {t("mahjongZen")}
              </h1>
              <img
                src={redDragon}
                alt="Red Dragon"
                className="w-12 h-12 opacity-60  rotate-right-on-float"
              />
            </div>
            <p className="text-muted-foreground text-lg">{t("gameManager")}</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onNewGame}
              size="lg"
              className="w-full bg-gradient-primary hover:shadow-elegant transition-smooth text-lg py-3"
            >
              <Play className="mr-2 h-5 w-5" />
              {t("newGame")}
            </Button>

            <Button
              onClick={onHistory}
              variant="outline"
              size="lg"
              className="w-full bg-card/80 border-border/50 hover:bg-accent/20 transition-smooth"
            >
              <Trophy className="mr-2 h-4 w-4" />
              {t("history")}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {t("traditionalMahjong")}
          </div>
        </div>
      </Card>
    </div>
  );
};
