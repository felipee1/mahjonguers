import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMahjongGame } from "@/contexts/MatchContext";
import { useToast } from "@/hooks/use-toast";
import { Wind } from "@/types/game";
import { ArrowLeft, Play, Shuffle, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

interface PlayerSetupProps {
  onPlayersReady: () => void;
  onBack: () => void;
}

const WINDS: Wind[] = ["east", "south", "west", "north"];

export const PlayerSetup: React.FC<PlayerSetupProps> = ({
  onPlayersReady,
  onBack,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [playerNames, setLocalPlayerNames] = useState(["", "", "", ""]);
  const { game, checkOnGoingGames, players, setPlayerNames } = useMahjongGame();

  useEffect(() => {
    if (checkOnGoingGames()) {
      const savedState = localStorage.getItem("mahjongGameState");
      const gameState = JSON.parse(savedState);
      setLocalPlayerNames(gameState.players.map((p) => p.name));
    }
  }, []);

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
    setLocalPlayerNames(newNames);
  };

  const handleStartGame = () => {
    const emptyNames = playerNames.filter((name) => name.trim() === "");
    if (emptyNames.length > 0) {
      toast({
        title: t("fillAllPlayers"),
        variant: "destructive",
      });
      return;
    }

    // Shuffle winds randomly
    setPlayerNames(playerNames);
    onPlayersReady();
  };

  const getWindDisplay = (wind: Wind) => {
    const windMap = {
      east: { char: "東", name: t("east") },
      south: { char: "南", name: t("south") },
      west: { char: "西", name: t("west") },
      north: { char: "北", name: t("north") },
    };
    return windMap[wind];
  };

  return (
    <div className="min-h-screen chinese-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute left-4 top-4 hover:bg-accent/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>

          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            {t("playerSetup")}
          </h1>
          <p className="text-muted-foreground">{t("enterPlayerNames")}</p>
        </div>

        <Card className="p-8 shadow-elegant border-border/50 bg-card/95 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Players Section */}
            <div className="flex items-center justify-center mb-6">
              <Users className="h-6 w-6 mr-2 text-primary" />
              <span className="text-xl font-semibold">
                {t("enterPlayerNames")}
              </span>
            </div>

            {/* Player Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {players.map((_, index) => (
                <div key={index} className="space-y-2">
                  <Label
                    htmlFor={`player-${index}`}
                    className="text-sm font-medium"
                  >
                    {t("player")} {index + 1}
                  </Label>
                  <Input
                    id={`player-${index}`}
                    value={playerNames[index]}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={`${t("player")} ${index + 1}`}
                    className="transition-smooth focus:shadow-soft"
                  />
                </div>
              ))}
            </div>

            {/* Wind Preview */}
            <div className="bg-muted/30 rounded-lg p-4 mt-6">
              <div className="flex items-center justify-center mb-4">
                <Shuffle className="h-5 w-5 mr-2 text-secondary" />
                <span className="text-sm text-muted-foreground">
                  Winds will be randomly assigned
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                {WINDS.map((wind) => {
                  const windInfo = getWindDisplay(wind);
                  return (
                    <div key={wind} className="space-y-1">
                      <div className="text-2xl text-primary">
                        {windInfo.char}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {windInfo.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start Game Button */}
            <Button
              onClick={handleStartGame}
              size="lg"
              className="w-full bg-gradient-primary hover:shadow-elegant transition-smooth mt-8"
            >
              <Play className="mr-2 h-5 w-5" />
              {t("startGame")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
