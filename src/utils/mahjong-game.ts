// --- Mahjong Game Objects ---
import { MAHJONG_TILES, MahjongTile, Player } from '@/types/game';
function createMahjongTileMap(tilesArray) {
  const tileMap = new Map();
  for (const tile of tilesArray) {
    // The tile's 'id' property is used as the key for the Map.
    tileMap.set(tile.id, tile);
  }
  return tileMap;
}
export const TILE_SET = createMahjongTileMap(MAHJONG_TILES);

/**
 * Returns the Dora indicator based on the given Dora tile.
 */
export function getDoraIndicatorTile(doraTile: MahjongTile): MahjongTile {
  if (["man", "pin", "sou"].includes(doraTile.type)) {
    if (doraTile.value=='dora') {
      return TILE_SET.get(
        `${doraTile.type}-6`
      )!;
    }
    if (doraTile.value === 9) {
      return TILE_SET.get(
       `${doraTile.type}-1`
      )!;
    }
    return TILE_SET.get(
      `${doraTile.type}-${Number(doraTile.value) + 1}`
    )!;
  }

  if (doraTile.type === "honor") {
    const winds = ["east", "south", "west", "north"];
    const dragons = ["white", "green", "red"];

    if (winds.includes(doraTile.value.toString())) {
      const currentIndex = winds.indexOf(doraTile.value.toString());
      const nextIndex = (currentIndex + 1) % 4;
      return TILE_SET.get("honor-" + winds[nextIndex])!;
    } else if (dragons.includes(doraTile.value.toString())) {
      const currentIndex = dragons.indexOf(doraTile.value.toString());
      const nextIndex = (currentIndex + 1) % 3;
      return TILE_SET.get("honor-" +dragons[nextIndex])!;
    }
  }
  return doraTile;
}

// Custom shuffle function
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export interface GameRanking {
  rank: number;
  name: string;
  points: number;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  players: string[];
  finalRanking: GameRanking[];
  totalRounds: number;
}

// --- Game Manager Class ---
export class RiichiMahjongMatch {
  players: Player[];
  numPlayers: number;
  prevalentWind: string;
  currentRound: number;
  dealerIndex: number;
  doraIndicators: MahjongTile[];
  dealer: Player;
  gamePhase: "playing" | "waiting" | "finished";

  /**
   * Manages the overall flow and state of a Mahjong match.
   */
  constructor(playerNames: string[]) {
    // Try to load a saved game. If not found, start a new one.
    if (!this.loadGameState()) {
      this.players = playerNames.map((name) => new Player(name));
      this.numPlayers = this.players.length;
      this.prevalentWind = "east";
      this.currentRound = 1;
      this.dealerIndex = 0;
      this.doraIndicators = [];
      this.gamePhase="waiting";
      this._setWinds();
      this.dealer = this.players[this.dealerIndex];
    }
  }

  private _setWinds(): void {
    shuffleArray(this.players);
    this.dealerIndex = 0;
    this.players[this.dealerIndex].wind = "east";
    this.players[this.dealerIndex].is_dealer = true;

    const windOrder = ["south", "west", "north"];
    for (let i = 1; i < this.numPlayers; i++) {
      this.players[i].wind = windOrder[i - 1];
      this.players[i].is_dealer = false;
    }
  }

  private _updatePlayerWinds(): void {
    const windOrder = ["east", "south", "west", "north"];
    for (let i = 0; i < this.numPlayers; i++) {
      const playerIdx = (this.dealerIndex + i) % this.numPlayers;
      this.players[playerIdx].wind = windOrder[i];
      this.players[playerIdx].is_dealer = i === 0;
    }
  }

  /**
   * Sets the initial Dora indicator for a new round.
   */
    private _setDora(doraTileName: string): void {
    if (TILE_SET.has(doraTileName)) {
        const doraTile = TILE_SET.get(doraTileName);
        this.doraIndicators.push(doraTile);
        console.log(`Dora Indicator is: ${ getDoraIndicatorTile(TILE_SET.get(doraTileName)).display}`);
    } else {
        console.log(`Error: Tile '${doraTileName}' not found.`);
    }
    // Save game state after setting Dora
    this.saveGameState();
  }

  private _advancePrevalentWind(): void {
    const winds = ["East", "South", "West", "North"];
    const currentIndex = winds.indexOf(this.prevalentWind);
    const nextIndex = (currentIndex + 1) % 4;
    this.prevalentWind = winds[nextIndex];
    console.log(`\nPrevalent wind has changed to: ${this.prevalentWind}!`);
  }

  /**
   * Adds a new Dora indicator when a Kan is called.
   */
  kan( doraTileName: string): void {
    console.log(`\n called a Kan!`);
    this._setDora(doraTileName);
    console.log(
      `New Dora indicators: ${this.doraIndicators.map((t) => t.display)}`
    );
  }
  update_players_names( newPlayerNames: string[]): void {
    newPlayerNames.map((name,index) => this.players[index].name=name );
  }

  private _displayCurrentScores(): void {
    console.log("Current Player Scores:");
    this.players.forEach((player) => {
      console.log(`- ${player.name}: ${player.score} pts`);
    });
  }

  startRound(initialDoraName: string): void {
    this.dealer = this.players[this.dealerIndex];
    this.doraIndicators = [];
    console.log("\n" + "=".repeat(50));
    console.log(
      `Starting Round ${this.currentRound} - Prevalent Wind: ${this.prevalentWind}`
    );
    console.log(`The dealer is ${this.dealer.name} (${this.dealer.wind} Wind)`);
    console.log("Initial Dora indicator is...");
    this._setDora(initialDoraName);
    this._displayCurrentScores();
    console.log("=".repeat(50));
    this.players.forEach((player) => {
      console.log(`- ${player.name}: ${player.wind} Wind`);
    });
    this.gamePhase = "playing";
    this.saveGameState();
  }

  /**
   * Adjusts points and rotates the dealer.
   */
  finishRound(
    winningPlayerName: string,
    winType: string,
    discardPlayerName: string | null = null,
    pointAmount: number
  ): void {
    const winner = this.players.find((p) => p.name === winningPlayerName);
    if (!winner) {
      console.log("Error: Winning player not found.");
      return;
    }

    console.log("\n" + "=".repeat(50));
    console.log(`Round ${this.currentRound} Finished!`);
    console.log(`Winner: ${winner.name}!`);

    if (winType.toLowerCase() === "ron") {
      if (!discardPlayerName) {
        console.log("Error: Ron win requires a discarder's name.");
        return;
      }
      const discarder = this.players.find((p) => p.name === discardPlayerName);
      if (!discarder) {
        console.log("Error: Discarding player not found.");
        return;
      }

      winner.score += pointAmount;
      discarder.score -= pointAmount;
      console.log(
        `${winner.name} won with Ron! ${discarder.name} pays ${pointAmount} points.`
      );
    } else if (winType.toLowerCase() === "tsumo") {
      const pointsPerPlayer = Math.floor(pointAmount / (this.numPlayers - 1));
      this.players.forEach((player) => {
        if (player.name !== winner.name) {
          player.score -= pointsPerPlayer;
          winner.score += pointsPerPlayer;
        }
      });
      console.log(
        `${winner.name} won with Tsumo! All other players pay ${pointsPerPlayer} points each.`
      );
    } else {
      console.log("Invalid win type. Round ends without a winner.");
      return;
    }

    this._displayCurrentScores();

    const hasRotated = !winner.is_dealer;
    if (hasRotated) {
      this.dealerIndex = (this.dealerIndex + 1) % this.numPlayers;
      console.log("Dealer has been rotated.");
      this._updatePlayerWinds();
    } else {
      console.log(
        `Dealer ${winner.name} won, so they will be the dealer again for the next round.`
      );
    }

    this.currentRound++;

    if ((this.currentRound - 1) % this.numPlayers === 0) {
      this._advancePrevalentWind();
    }
    this.gamePhase = "finished";
    this.doraIndicators=[]
    // Save game state at the end of each round
    this.saveGameState();

    console.log("=".repeat(50));
  }

  /**
   * Saves the current game state to localStorage.
   */
  saveGameState(): void {
    const gameState = {
      players: this.players.map((player) => ({
        name: player.name,
        points: player.score,
        wind: player.wind,
        is_dealer: player.is_dealer,
      })),
      prevalentWind: this.prevalentWind,
      currentRound: this.currentRound,
      dealerIndex: this.dealerIndex,
      gamePhase: this.gamePhase,
      doraIndicators: this.doraIndicators.map((tile) => tile.id),
    };
    localStorage.setItem("mahjongGameState", JSON.stringify(gameState));
    console.log("Game state saved to localStorage.");
  }

  /**
   * Loads game state from localStorage.
   */
  loadGameState(): boolean {
    const savedState = localStorage.getItem("mahjongGameState");
    if (savedState) {
      const gameState = JSON.parse(savedState);
      this.players = gameState.players.map((p: any) => {
        const player = new Player(p.name, p.points);
        player.wind = p.wind;
        player.is_dealer = p.is_dealer;
        return player;
      });
      this.prevalentWind = gameState.prevalentWind;
      this.currentRound = gameState.currentRound;
      this.dealerIndex = gameState.dealerIndex;
      this.dealer = this.players[this.dealerIndex];
      this.gamePhase=gameState.gamePhase;
      this.doraIndicators = gameState.doraIndicators
        .map((name: string) => {
          const tile = TILE_SET.get(name);
          if (tile) {
            return tile;
          }
          return null;
        })
        .filter((tile: MahjongTile | null) => tile !== null);

      this.numPlayers = this.players.length;

      console.log("Game state loaded from localStorage.");
      return true;
    }
    console.log("No saved game state found.");
    return false;
  }

  /**
   * Finishes the match, shows ranking and saves to localStorage.
   */
  finishMatch(): void {
    // 1. Show and save final ranking
    this.players.sort((a, b) => b.score - a.score);
    const ranking: GameRanking[] = this.players.map((player, i) => ({
      rank: i + 1,
      name: player.name,
      points: player.score,
    }));

    console.log("\n" + "=".repeat(50));
    console.log("MATCH FINISHED! FINAL RANKING:");
    ranking.forEach((p) => {
      console.log(`Rank ${p.rank}: ${p.name} with ${p.points} points.`);
    });
    console.log("=".repeat(50));

    // Save final ranking in a separate key
    localStorage.setItem("mahjongFinalRanking", JSON.stringify(ranking));
    
    // Save to game history
    this._saveToGameHistory(ranking);
    
    console.log("Final ranking saved to localStorage.");

    // 2. Reset game for a new match
    this.resetGame();
  }

  /**
   * Saves completed game to history.
   */
  private _saveToGameHistory(ranking: GameRanking[]): void {
    const gameEntry: GameHistoryEntry = {
      id: `game-${Date.now()}`,
      date: new Date().toISOString(),
      players: this.players.map(p => p.name),
      finalRanking: ranking,
      totalRounds: this.currentRound - 1
    };

    const existingHistory = this.getGameHistory();
    const newHistory = [gameEntry, ...existingHistory].slice(0, 5); // Keep only last 5 games
    
    localStorage.setItem("mahjongGameHistory", JSON.stringify(newHistory));
  }

  /**
   * Gets game history from localStorage.
   */
  static getGameHistory(): GameHistoryEntry[] {
    const history = localStorage.getItem("mahjongGameHistory");
    return history ? JSON.parse(history) : [];
  }

  /**
   * Gets game history from localStorage (instance method).
   */
  getGameHistory(): GameHistoryEntry[] {
    return RiichiMahjongMatch.getGameHistory();
  }

  /**
   * Resets the game by removing saved state.
   */
  resetGame(): void {
    localStorage.removeItem("mahjongGameState");
    console.log("Game state cleared from localStorage. Ready for a new game.");
  }
}