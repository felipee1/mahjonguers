// Index.tsx (Corrected with null checks)
import { GameBoard } from "@/components/GameBoard";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MainMenu } from "@/components/MainMenu";
import { DoraSelectionModal } from "@/components/modals/DoraSelectionModal";
import { ScoringData, ScoringModal } from "@/components/modals/ScoringModal";
import { PlayerSetup } from "@/components/PlayerSetup";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useMahjongGame } from "@/contexts/MatchContext";
import { GameHistory } from "@/pages/GameHistory";
import { Tile } from "@/types/game";
import { useState } from "react";
type AppPhase = "menu" | "setup" | "game" | "history";

const Index = () => {
  const [appPhase, setAppPhase] = useState<AppPhase>("menu");
  const [showDoraModal, setShowDoraModal] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [scoringAction, setScoringAction] = useState<"ron" | "tsumo">("ron");
  // Use the context hook
  const {
    players,
    dealer,
    doraIndicators,
    gamePhase,
    startNewRound,
    finishRound,
    kan,
    checkOnGoingGames,
    finishMatch,
  } = useMahjongGame();

  const handleNewGame = () => {
    checkOnGoingGames();
    setAppPhase("setup");
  };

  const handleHistory = () => {
    setAppPhase("history");
  };

  const handlePlayersReady = () => {
    setAppPhase("game");
  };

  const handleStartNewRound = () => {
    setShowDoraModal(true);
  };
  const handleFinishMatch = () => {
    finishMatch();
    setAppPhase("menu");
  };

  const handleDoraSelected = (dora: { tile?: Tile; imageUrl?: string }) => {
    if (dora.tile?.id) {
      if (gamePhase == "waiting") {
        startNewRound(dora.tile.id);
      } else {
        kan(dora.tile.id);
      }
    }
    setShowDoraModal(false);
  };

  const handleRon = () => {
    setScoringAction("ron");
    setShowScoringModal(true);
  };

  const handleTsumo = () => {
    setScoringAction("tsumo");
    setShowScoringModal(true);
  };

  const handleScoringConfirm = (scoringData: ScoringData) => {
    if (scoringAction === "ron" && scoringData.ronPlayer) {
      finishRound(
        scoringData.winnerPlayer,
        "ron",
        scoringData.ronPlayer,
        scoringData.totalPoints
      );
    } else if (scoringAction === "tsumo") {
      finishRound(
        scoringData.winnerPlayer,
        "tsumo",
        null,
        scoringData.totalPoints
      );
    }
    setShowScoringModal(false);
  };

  const handleKan = () => {
    setShowDoraModal(true);
  };

  const handleBack = () => {
    if (appPhase === "setup" || appPhase === "history") {
      setAppPhase("menu");
    } else if (appPhase === "game") {
      setAppPhase("setup");
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <LanguageToggle />
        {appPhase === "menu" && (
          <MainMenu onNewGame={handleNewGame} onHistory={handleHistory} />
        )}

        {appPhase === "history" && <GameHistory onBack={handleBack} />}

        {appPhase === "setup" && (
          <PlayerSetup
            onPlayersReady={handlePlayersReady}
            onBack={handleBack}
          />
        )}

        {/* Conditional rendering to prevent TypeError */}
        {appPhase === "game" && players.length > 0 && dealer && (
          <GameBoard
            doras={doraIndicators}
            gamePhase={gamePhase}
            onStartNewRound={handleStartNewRound}
            onFinishMatch={handleFinishMatch}
            onRon={handleRon}
            onTsumo={handleTsumo}
            onKan={handleKan}
            onBack={handleBack}
          />
        )}

        <DoraSelectionModal
          isOpen={showDoraModal}
          onClose={() => setShowDoraModal(false)}
          onConfirm={handleDoraSelected}
        />

        <ScoringModal
          isOpen={showScoringModal}
          onClose={() => setShowScoringModal(false)}
          onConfirm={handleScoringConfirm}
          actionType={scoringAction}
          doras={doraIndicators}
        />
      </div>
    </LanguageProvider>
  );
};

export default Index;
