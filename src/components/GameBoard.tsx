import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMahjongGame } from "@/contexts/MatchContext";
import { Wind } from "@/types/game";
import { ArrowLeft, Minus, Plus, Square } from "lucide-react";
import React from "react";

interface GameBoardProps {
  doras;
  gamePhase;
  onStartNewRound: () => void;
  onFinishMatch: () => void;
  onRon: () => void;
  onTsumo: () => void;
  onKan: () => void;
  onBack: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  doras,
  gamePhase,
  onStartNewRound,
  onFinishMatch,
  onRon,
  onTsumo,
  onKan,
  onBack,
}) => {
  const { t } = useLanguage();
  const { players, currentRound, prevalentWind } = useMahjongGame();

  const getWindDisplay = (wind: Wind) => {
    const windMap = {
      east: {
        char: "東",
        name: t("east"),
        color: "bg-primary",
      },
      south: {
        char: "南",
        name: t("south"),
        color: "bg-yellow-500",
      },
      west: {
        char: "西",
        name: t("west"),
        color: "bg-yellow-500",
      },
      north: {
        char: "北",
        name: t("north"),
        color: "bg-yellow-500",
      },
    };
    return windMap[wind.toLowerCase()];
  };

  const getPrevailingWindDisplay = () => {
    const windMap = {
      east: { char: "東", name: t("east") },
      south: { char: "南", name: t("south") },
      west: { char: "西", name: t("west") },
      north: { char: "北", name: t("north") },
    };
    return windMap[prevalentWind.toLowerCase()];
  };

  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  return (
    <div className="min-h-screen chinese-pattern p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="hover:bg-accent/20">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {t("round")} {currentRound}
          </h1>
          <div className="flex items-center justify-center mt-2">
            <span className="text-sm text-muted-foreground mr-2">
              {t("prevailingWind")} {getPrevailingWindDisplay().name}:
            </span>
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
              {getPrevailingWindDisplay().char}
            </div>
          </div>
        </div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Game Board */}
      <div className="max-w-6xl mx-auto">
        {/* Players in Wind Positions */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {players.map((player, index) => {
            const windInfo = getWindDisplay(player.wind);
            return (
              <Card
                key={index}
                className="p-6 shadow-soft border-border/50 bg-card/95 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={`${windInfo.color} text-white px-3 py-1`}
                      >
                        {windInfo.char}
                      </Badge>
                      <span className="font-semibold text-lg">
                        {player.name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground md:hidden">
                      {windInfo.name} • {t("score")}
                      <br />
                      <div className="text-sm font-bold text-primary md:hidden">
                        {formatScore(player.score)}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary hidden sm:block ">
                    {formatScore(player.score)}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground hidden sm:block ">
                  {windInfo.name}
                </span>
              </Card>
            );
          })}
        </div>

        {/* Dora Display */}
        {doras.length > 0 && (
          <Card className="p-6 mb-8 shadow-soft border-border/50 bg-card/95 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Square className="h-5 w-5 mr-2 text-secondary" />
              {t("dora")}
            </h3>
            <div className="flex flex-wrap gap-4">
              {doras.map((dora, index) => (
                <div key={dora.id} className="space-y-2 m-4">
                  <Badge variant="outline" className="text-xs">
                    {t("dora")} {index + 1}
                  </Badge>
                  <div className="flex justify-center">
                    <div className="w-16 h-20 bg-muted rounded border-2 border-primary flex items-center justify-center p-1">
                      {dora.imageUrl ? (
                        <span className="text-2xl font-bold">
                          <img
                            src={dora.imageUrl}
                            alt="Dora"
                            className="w-full h-full object-contain"
                          />
                        </span>
                      ) : dora ? (
                        <span className="text-2xl font-bold">
                          {dora.display}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Empty
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Game Actions */}
        <div className="space-y-4">
          {gamePhase != "playing" ? (
            <Button
              onClick={onStartNewRound}
              size="lg"
              className="w-full bg-gradient-primary hover:shadow-elegant transition-smooth"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("startNewRound")}
            </Button>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={onRon}
                size="lg"
                variant="outline"
                className="bg-card/80 border-primary/50 hover:bg-primary/10 hover:border-primary transition-smooth"
              >
                {t("ron")}
              </Button>
              <Button
                onClick={onTsumo}
                size="lg"
                variant="outline"
                className="bg-card/80 border-secondary/50 hover:bg-secondary/10 hover:border-secondary transition-smooth"
              >
                {t("tsumo")}
              </Button>
              <Button
                onClick={onKan}
                size="lg"
                variant="outline"
                className="bg-card/80 border-accent/50 hover:bg-accent/10 hover:border-accent transition-smooth"
              >
                {t("kan")}
              </Button>
            </div>
          )}
          {gamePhase === "finished" && (
            <Button
              onClick={onFinishMatch}
              size="lg"
              className="w-full bg-gray-900 hover:shadow-elegant transition-smooth"
            >
              <Minus className="mr-2 h-5 w-5" />
              {t("resetMatch")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
