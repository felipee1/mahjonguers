// MatchContext.tsx
import { useAuth } from "@/contexts/AuthContext";
import { firestoreService } from "@/services/firestoreService";
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
    pointAmount: number,
  ) => void;
  drawRound: (tenpaiPlayerNames: string[]) => void;
  kan: (doraTileName: string) => void;
  resetGame: () => void;
  finishMatch: () => void;
  setGame: (game: RiichiMahjongMatch) => void;
  setPlayerNames: (names: string[]) => void;
  checkOnGoingGames: () => boolean;
  roomId: string | null;
  createRoom: () => Promise<string>;
  joinRoom: (roomId: string) => Promise<void>;
}

const MahjongGameContext = createContext<MahjongGameContextType | undefined>(
  undefined,
);

interface MahjongGameProviderProps {
  children: ReactNode;
  initialPlayerNames?: string[];
}

export const MahjongGameProvider: React.FC<MahjongGameProviderProps> = ({
  children,
  initialPlayerNames = ["", "", "", ""],
}) => {
  const { currentUser } = useAuth();
  const [game, setGame] = useState<RiichiMahjongMatch | null>(null);
  const [gamePhase, setGamePhase] = useState<
    "playing" | "waiting" | "finished"
  >("waiting");
  const [playerNames, setPlayerNames] = useState<string[]>(initialPlayerNames);
  const [roomId, setRoomId] = useState<string | null>(null);

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
  }, [playerNames, game, initialPlayerNames]);

  // Load game from Firestore when user logs in
  useEffect(() => {
    const loadFromFirestore = async () => {
      if (currentUser && game && !roomId) {
        try {
          const firestoreState = await firestoreService.loadGameState(
            currentUser.uid,
          );
          if (firestoreState && firestoreState.players.length > 0) {
            const players = firestoreState.players.map((p: any) => {
              const player = new Player(p.name, p.points);
              player.wind = p.wind;
              player.is_dealer = p.is_dealer;
              return player;
            });
            const new_game = new RiichiMahjongMatch(players.map((p) => p.name));
            new_game.loadGameState();
            setGame(new_game);
            setGamePhase(new_game.gamePhase);
            console.log("Game state loaded from Firestore.");
          }
        } catch (error) {
          console.error("Failed to load from Firestore:", error);
        }
      }
    };
    loadFromFirestore();
  }, [currentUser, roomId]);

  // Room synchronization
  useEffect(() => {
    if (roomId) {
      const unsubscribe = firestoreService.listenRoomState(roomId, (gameState) => {
        if (gameState && gameState.players) {
          // Sync state from server
          const new_game = new RiichiMahjongMatch(gameState.players.map((p: any) => p.name));
          
          // Rehydrate with explicit object because loadGameState looks at localStorage
          // Let's manually inject the gameState data instead of relying solely on localStorage
          // For simplicity we use localStorage as intermediate step
          localStorage.setItem("mahjongGameState", JSON.stringify(gameState));
          new_game.loadGameState();
          
          setGame(new_game);
          setGamePhase(new_game.gamePhase);
          console.log("Game synced with room.");
        }
      });
      return () => unsubscribe();
    }
  }, [roomId]);

  const syncState = async (gameStateToSave: any) => {
    if (roomId) {
      await firestoreService.updateRoomState(roomId, gameStateToSave);
    } else if (currentUser) {
      await firestoreService.saveGameState(currentUser.uid, gameStateToSave);
    }
  };

  const createRoom = async () => {
    if (!game) return "";
    
    // Make sure we have the latest state serialized
    await game.saveGameState(); 
    const savedState = localStorage.getItem("mahjongGameState");
    if (!savedState) return "";

    const gameState = JSON.parse(savedState);
    const newRoomId = await firestoreService.createRoom(gameState);
    setRoomId(newRoomId);
    return newRoomId;
  };

  const joinRoom = async (roomToJoin: string) => {
    const roomState = await firestoreService.getRoomState(roomToJoin);
    if (roomState) {
      setRoomId(roomToJoin);
    } else {
      throw new Error("Room not found");
    }
  };

  const updateGamePhase = async (phase: "playing" | "waiting" | "finished") => {
    if (game) {
      console.log("Updating game phase to", phase);
      game.gamePhase = phase;
      setGamePhase(game.gamePhase);
      
      await game.saveGameState();
      const savedState = localStorage.getItem("mahjongGameState");
      if (savedState) await syncState(JSON.parse(savedState));
    }
  };

  const startNewRound = async (initialDoraName: string) => {
    if (game) {
      console.log("Starting new round ", initialDoraName);
      game.startRound(initialDoraName);
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

  const finishRound = async (
    winningPlayerName: string,
    winType: "ron" | "tsumo",
    discardPlayerName: string | null,
    pointAmount: number,
  ) => {
    if (game) {
      // Create a compatible winner structure for our Double Ron refactored function
      game.finishRound(
        [{ playerName: winningPlayerName, points: pointAmount }],
        winType,
        discardPlayerName,
      );
      await updateGamePhase("finished");
    }
  };
  
  const drawRound = async (tenpaiPlayerNames: string[]) => {
    if (game) {
      game.drawRound(tenpaiPlayerNames);
      await updateGamePhase("finished");
    }
  };

  const kan = async (doraTileName: string) => {
    if (game) {
      game.kan(doraTileName);
      await game.saveGameState();
      const savedState = localStorage.getItem("mahjongGameState");
      if (savedState) await syncState(JSON.parse(savedState));
    }
  };

  const resetGame = async () => {
    if (game) {
      game.resetGame();
      await updateGamePhase("waiting");
    }
  };
  const finishMatch = async () => {
    if (game) {
      game.finishMatch();
      if (currentUser && !roomId) {
        try {
          await firestoreService.deleteGameState(currentUser.uid);
        } catch (error) {
          console.error("Failed to clear Firestore state:", error);
        }
      }
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
    drawRound,
    kan,
    resetGame,
    finishMatch,
    setPlayerNames,
    checkOnGoingGames,
    roomId,
    createRoom,
    joinRoom,
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
