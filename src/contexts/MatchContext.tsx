// MatchContext.tsx
import { MahjongTile, Player, Wind } from "@/types/game";
import { RiichiMahjongMatch } from "@/utils/mahjong-game";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface MahjongGameContextType {
  game: RiichiMahjongMatch;
  players: Player[];
  currentRound: number;
  dealer: Player | null;
  doraIndicators: MahjongTile[];
  prevalentWind: Wind;
  gamePhase: "playing" | "waiting" | "finished";
  startNewRound: (initialDoraName: string) => void;
  finishRound: (
    winningPlayerName: string,
    winType: "ron" | "tsumo",
    discardPlayerName: string | null,
    pointAmount: number
  ) => void;
  kan: (doraTileName: string) => void;
  resetGame: () => void;
  finishMatch: () => void;
  setGame: (game: RiichiMahjongMatch) => void;
  setPlayerNames: (names: string[]) => void;
  checkOnGoingGames: () => boolean;
}

const MahjongGameContext = createContext<MahjongGameContextType | undefined>(
  undefined
);

interface MahjongGameProviderProps {
  children: ReactNode;
  initialPlayerNames?: string[];
}

export const MahjongGameProvider: React.FC<MahjongGameProviderProps> = ({
  children,
  initialPlayerNames = ["", "", "", ""],
}) => {
  const [game, setGame] = useState<RiichiMahjongMatch | null>(null);
  const [gamePhase, setGamePhase] = useState<
    "playing" | "waiting" | "finished"
  >("waiting");
  const [playerNames, setPlayerNames] = useState<string[]>(initialPlayerNames);

  // Initialize or load game state
  useEffect(() => {
    if (game) {
      game.update_players_names(playerNames);
      setGamePhase(game.gamePhase);
    } else {
      const mahjongGame = new RiichiMahjongMatch(playerNames);
      setGamePhase("waiting");
      setGame(mahjongGame);
    }
  }, [playerNames, game, initialPlayerNames]); // Re-initialize game if playerNames change
  const updateGamePhase = (phase: "playing" | "waiting" | "finished") => {
    if (game) {
      console.log("Starting new round ", phase);
      game.gamePhase = phase;
      setGamePhase(game.gamePhase);
    }
  };
  const startNewRound = (initialDoraName: string) => {
    if (game) {
      console.log("Starting new round ", initialDoraName);
      game.startRound(initialDoraName);
      updateGamePhase("playing");
    } else {
      console.log("Starting new round and game", initialDoraName);
      const new_game = new RiichiMahjongMatch(playerNames.map((p) => p));
      new_game.startRound(initialDoraName);
      setGame(new_game);
      updateGamePhase("playing");
    }
  };

  const checkOnGoingGames = () => {
    const savedState = localStorage.getItem("mahjongGameState");
    if (savedState) {
      const gameState = JSON.parse(savedState);
      const players = gameState.players.map((p: any) => {
        const player = new Player(p.name, p.points);
        player.wind = p.wind;
        player.is_dealer = p.is_dealer;
        return player;
      });
      const new_game = new RiichiMahjongMatch(players.map((p) => p.name));
      new_game.loadGameState();
      setGame(new_game);
      setGamePhase(new_game.gamePhase);
      return true;
    } else {
      return false;
    }
  };

  const finishRound = (
    winningPlayerName: string,
    winType: "ron" | "tsumo",
    discardPlayerName: string | null,
    pointAmount: number
  ) => {
    if (game) {
      game.finishRound(
        winningPlayerName,
        winType,
        discardPlayerName,
        pointAmount
      );
      updateGamePhase("finished");
    }
  };

  const kan = (doraTileName: string) => {
    if (game) {
      game.kan(doraTileName);
    }
  };

  const resetGame = () => {
    if (game) {
      game.resetGame();
      updateGamePhase("waiting");
    }
  };
  const finishMatch = () => {
    if (game) {
      game.finishMatch();
      updateGamePhase("waiting");
    }
  };

  const value = {
    game: game,
    players: game?.players || [],
    currentRound: game?.currentRound || 0,
    dealer: game?.dealer || null,
    doraIndicators: game?.doraIndicators || [],
    prevalentWind: game?.prevalentWind || "east",
    gamePhase: gamePhase,
    setGame,
    startNewRound,
    finishRound,
    kan,
    resetGame,
    finishMatch,
    setPlayerNames,
    checkOnGoingGames,
  };

  return (
    <MahjongGameContext.Provider value={value}>
      {children}
    </MahjongGameContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMahjongGame = () => {
  const context = useContext(MahjongGameContext);
  if (context === undefined) {
    throw new Error("useMahjongGame must be used within a MahjongGameProvider");
  }
  return context;
};
