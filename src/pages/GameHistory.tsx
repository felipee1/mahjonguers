import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { RiichiMahjongMatch } from "@/utils/mahjong-game";
import { ArrowLeft, Calendar, Target, Trophy, Users } from "lucide-react";
import React from "react";

interface GameHistoryProps {
  onBack: () => void;
}

export const GameHistory: React.FC<GameHistoryProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const gameHistory = RiichiMahjongMatch.getGameHistory();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-yellow-50";
      case 2:
        return "bg-gray-400 text-gray-50";
      case 3:
        return "bg-amber-600 text-amber-50";
      default:
        return "bg-muted text-muted-foreground";
    }
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
          <h1 className="text-2xl font-bold flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-primary" />
            {t("gameHistory")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("lastFiveGames")}</p>
        </div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Game History */}
      <div className="max-w-4xl mx-auto space-y-6">
        {gameHistory.length === 0 ? (
          <Card className="p-8 text-center shadow-soft border-border/50 bg-card/95 backdrop-blur-sm">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">{t("noGamesPlayed")}</h2>
            <p className="text-muted-foreground">{t("playFirstGame")}</p>
          </Card>
        ) : (
          gameHistory.map((game, index) => (
            <Card
              key={game.id + index}
              className="p-6 shadow-soft border-border/50 bg-card/95 backdrop-blur-sm"
            >
              <div className="space-y-4">
                {/* Game Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="px-3 py-1">
                      {t("game")} #{index + 1}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(game.date)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Target className="h-4 w-4 mr-1" />
                      {game.totalRounds} {t("rounds")}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {game.players.length} {t("players")}
                  </div>
                </div>

                {/* Final Ranking */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-secondary" />
                    {t("finalRanking")}
                  </h3>
                  <div className="grid gap-2">
                    {game.finalRanking.map((player, index) => (
                      <div
                        key={`${game.id}-${player.name}-${index}`}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge
                            className={`${getRankBadgeColor(
                              player.rank
                            )} px-2 py-1 text-xs font-bold`}
                          >
                            #{player.rank}
                          </Badge>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {player.points.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
