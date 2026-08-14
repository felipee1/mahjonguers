import greenDragon from "@/assets/green-dragon.png";
import redDragon from "@/assets/red-dragon.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Play, Trophy, BookOpen } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface MainMenuProps {
  onNewGame: () => void;
  onHistory: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onHistory }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
              <h1 className="text-4xl font-heading font-extrabold text-foreground">
                {t("mahjongZen")}
              </h1>
              <img
                src={redDragon}
                alt="Red Dragon"
                className="w-12 h-12 opacity-60  rotate-right-on-float"
              />
            </div>
            <p className="text-muted-foreground font-sans text-lg">{t("gameManager")}</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onNewGame}
              size="lg"
              className="w-full text-lg py-6"
            >
              <Play className="mr-2 h-5 w-5" />
              {t("newGame")}
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const id = prompt(t("enterRoomId"));
                  if (id) {
                    // Logic to join room via context will be handled in a parent component
                    // We'll pass a custom event or handler
                    const event = new CustomEvent("joinRoom", { detail: id });
                    window.dispatchEvent(event);
                  }
                }}
                variant="outline"
                className="flex-1 bg-card/80 border-border/50 hover:bg-accent/20 transition-smooth"
              >
                {t("joinRoom")}
              </Button>
              <Button
                onClick={() => {
                  const event = new CustomEvent("createRoom");
                  window.dispatchEvent(event);
                }}
                variant="outline"
                className="flex-1 bg-card/80 border-border/50 hover:bg-accent/20 transition-smooth"
              >
                {t("createRoom")}
              </Button>
            </div>

            <Button
              onClick={onHistory}
              variant="outline"
              size="lg"
              className="w-full bg-card/80 border-border/50 hover:bg-accent/20 transition-smooth"
            >
              <Trophy className="mr-2 h-4 w-4" />
              {t("history")}
            </Button>

            <Button
              onClick={() => navigate('/help')}
              variant="outline"
              size="lg"
              className="w-full bg-card/80 border-border/50 hover:bg-accent/20 transition-smooth"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Rules & Help
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
