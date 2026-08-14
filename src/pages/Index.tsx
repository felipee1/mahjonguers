// Index.tsx (Corrected with null checks)
import { GameBoard } from "@/components/GameBoard";
import { SettingsToggle } from "@/components/SettingsToggle";
import { MainMenu } from "@/components/MainMenu";
import { DoraSelectionModal } from "@/components/modals/DoraSelectionModal";
import { WallSetupModal } from "@/components/modals/WallSetupModal";
import { ScoringData, ScoringModal } from "@/components/modals/ScoringModal";
import { PlayerSetup } from "@/components/PlayerSetup";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMahjongGame } from "@/contexts/MatchContext";
import { GameHistory } from "@/pages/GameHistory";
import { Tile } from "@/types/game";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
type AppPhase = "menu" | "setup" | "game" | "history";

const Index = () => {
  const [appPhase, setAppPhase] = useState<AppPhase>("menu");
  const [showWallSetupModal, setShowWallSetupModal] = useState(false);
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
    drawRound,
    kan,
    checkOnGoingGames,
    finishMatch,
    createRoom,
    joinRoom,
    roomId,
  } = useMahjongGame();
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleCreateRoom = async () => {
      if (!currentUser) {
        alert(t("loginRequired") || "Please login first");
        return;
      }
      try {
        const id = await createRoom();
        alert(`${t("roomCreated")}${id}`);
        setAppPhase("setup");
      } catch (err: any) {
        console.error("Create room error:", err);
        alert(`${t("roomCreateFailed")} ${err.message || err}`);
      }
    };
    
    const handleJoinRoom = async (e: any) => {
      if (!currentUser) {
        alert(t("loginRequired") || "Please login first");
        return;
      }
      try {
        await joinRoom(e.detail);
        alert(t("joinedRoom"));
        setAppPhase("game"); // Assuming the room has started
      } catch (err: any) {
        console.error("Join room error:", err);
        alert(`${t("roomJoinFailed")} ${err.message || err}`);
      }
    };

    window.addEventListener("createRoom", handleCreateRoom as EventListener);
    window.addEventListener("joinRoom", handleJoinRoom as EventListener);

    return () => {
      window.removeEventListener("createRoom", handleCreateRoom as EventListener);
      window.removeEventListener("joinRoom", handleJoinRoom as EventListener);
    };
  }, [createRoom, joinRoom]);

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
    setShowWallSetupModal(true);
  };

  const handleWallSetupComplete = () => {
    setShowWallSetupModal(false);
    setShowDoraModal(true);
  };

  const handleFinishMatch = () => {
    finishMatch();
    setAppPhase("menu");
  };

  const handleDoraSelected = (dora: { tile?: Tile; imageUrl?: string }) => {
    if (dora.tile?.id) {
      if (gamePhase == "waiting" || gamePhase == "finished") {
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
  const handleTenpai = (tenpaiPlayers: string[]) => {
    if (!tenpaiPlayers) {
      drawRound(tenpaiPlayers);
    } else {
      drawRound(tenpaiPlayers);
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
    <div className="min-h-screen">
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
          onTenpai={handleTenpai}
          onKan={handleKan}
          onBack={handleBack}
        />
      )}

      <WallSetupModal
        isOpen={showWallSetupModal}
        dealerWind={dealer?.wind || "east"}
        onComplete={handleWallSetupComplete}
      />

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
  );
};

export default Index;
