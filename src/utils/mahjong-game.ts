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
  riichiBets: number = 0;
  discards: Record<string, MahjongTile[]> = {};

  /**
   * Manages the overall flow and state of a Mahjong match.
   */
  constructor(playerNames: string[]) {
    // Replace empty names with default Player N, and ensure exactly 4 players
    const names = [...playerNames].map((name, i) => name.trim() || `Player ${i + 1}`);
    while (names.length < 4) {
      names.push(`Player ${names.length + 1}`);
    }
    // Try to load a saved game. If not found, start a new one.
    if (!this.loadGameState()) {
      this.players = names.map((name) => new Player(name));
      this.numPlayers = this.players.length;
      this.prevalentWind = "east";
      this.currentRound = 1;
      this.dealerIndex = 0;
      this.doraIndicators = [];
      this.gamePhase="waiting";
      this.riichiBets = 0;
      this.players.forEach(p => this.discards[p.name] = []);
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
        if (doraTile) {
          this.doraIndicators.push(doraTile);
          console.log(`Dora Indicator is: ${ getDoraIndicatorTile(doraTile).display}`);
        }
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

  discardTile(playerName: string, tileId: string): void {
    const tile = TILE_SET.get(tileId);
    if (!tile) return;
    if (!this.discards[playerName]) {
      this.discards[playerName] = [];
    }
    this.discards[playerName].push(tile);
    this.saveGameState();
  }

  isFuriten(playerName: string, waitTiles: MahjongTile[]): boolean {
    const playerDiscards = this.discards[playerName] || [];
    // If the player has discarded ANY of the tiles they are waiting on, they are in Furiten.
    for (const wait of waitTiles) {
      if (playerDiscards.some(t => t.equals(wait))) {
        return true;
      }
    }
    return false;
  }

  chombo(playerName: string): void {
    const player = this.players.find(p => p.name === playerName);
    if (!player) return;

    console.log("\n" + "=".repeat(50));
    console.log(`Chombo! ${player.name} committed a severe foul.`);
    
    // EMA Chombo: 12000 points (4000 to each other player if non-dealer) or 4000 all (if dealer)
    // Actually, EMA specifies Mangan payment: Non-dealer pays 4000 to dealer, 2000 to non-dealers. Dealer pays 4000 to all.
    // Let's implement simplified 12000 total distribution.
    const payment = player.is_dealer ? 4000 : 3000; // Simplified
    
    this.players.forEach(p => {
      if (p.name !== playerName) {
        if (player.is_dealer) {
          p.score += 4000;
          player.score -= 4000;
        } else {
          const amt = p.is_dealer ? 4000 : 2000;
          p.score += amt;
          player.score -= amt;
        }
      }
    });

    this._displayCurrentScores();
    console.log("=".repeat(50));
    
    // The round is usually voided and replayed with same dealer and winds
    this.gamePhase = "finished";
    this.saveGameState();
  }

  /**
   * Handles the end of a round that results in an exhaustive draw (ryūkyoku).
   * @param tenpaiPlayerNames An array of names of players who declared tenpai.
   */
  drawRound(tenpaiPlayerNames: string[]): void {
    console.log("\n" + "=".repeat(50));
    console.log(`Round ${this.currentRound} Finished! - Exhaustive Draw (Ryūkyoku)`);

    const tenpaiPlayers = this.players.filter(p => tenpaiPlayerNames.includes(p.name));
    const notTenpaiPlayers = this.players.filter(p => !tenpaiPlayerNames.includes(p.name));
    
    const numTenpai = tenpaiPlayers.length;
    const numNotTenpai = notTenpaiPlayers.length;

    // Tenpai scoring rule: The total of 3000 points is exchanged.
    // This happens only if 1, 2, or 3 players are in tenpai.
    if (numTenpai > 0 && numTenpai < this.numPlayers) {
      // Points distributed by the tenpai count:
      // 1 tenpai: 3000 pts from 3 players (1000 each)
      // 2 tenpai: 1500 pts from 2 players (1500 each)
      // 3 tenpai: 1000 pts from 1 player (3000 total)
      const tenpaiGain = 3000 / numTenpai; // Amount each tenpai player *gains*
      const notTenpaiLoss = 3000 / numNotTenpai; // Amount each not-tenpai player *loses*

      // 1. Players in tenpai gain points
      tenpaiPlayers.forEach(player => {
        // The points received from each not-tenpai player. 
        // Example: 1 tenpai player receives 1000 from each of the 3 not-tenpai players.
        const pointsGained = tenpaiGain * numNotTenpai;
        player.score += pointsGained;
        console.log(`${player.name} (Tenpai) gains ${pointsGained} points.`);
      });

      // 2. Players not in tenpai lose points
      notTenpaiPlayers.forEach(player => {
        // The points lost to each tenpai player. 
        // Example: 3 not-tenpai players lose 1000 to the 1 tenpai player.
        const pointsLost = notTenpaiLoss * numTenpai;
        player.score -= pointsLost;
        console.log(`${player.name} (Not Tenpai) loses ${pointsLost} points.`);
      });

      // Optional: Round points to nearest 100 for standard Riichi rules, 
      // but keeping it as calculated for simplicity.
    } else {
      console.log("All players were in tenpai or not in tenpai. No point exchange occurs.");
    }
    
    this._displayCurrentScores();

    // Dealer Continuation Logic (Renchan):
    // The dealer (this.dealer) retains their seat if they were in tenpai.
    const dealerWasTenpai = tenpaiPlayers.includes(this.dealer);

    if (dealerWasTenpai) {
      console.log(
        `Dealer ${this.dealer.name} was in tenpai, so they will be the dealer again for the next round (Renchan).`
      );
      // currentRound does not increment on a dealer win/draw
    } else {
      // Rotate the dealer seat
      this.dealerIndex = (this.dealerIndex + 1) % this.numPlayers;
      this.dealer = this.players[this.dealerIndex];
      this.currentRound++; // Round increments only when the dealer rotates
      console.log("Dealer has been rotated.");
      this._updatePlayerWinds();
    }

    if ((this.currentRound - 1) % this.numPlayers === 0) {
      this._advancePrevalentWind();
    }
    
    this.gamePhase = "finished";
    this.doraIndicators=[]
    this.saveGameState();

    console.log("=".repeat(50));
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
   * Supports multiple winners for Double/Triple Ron.
   */
  finishRound(
    winners: { playerName: string; points: number }[],
    winType: string,
    discardPlayerName: string | null = null
  ): void {
    if (winners.length === 0) {
      console.log("Error: No winners provided.");
      return;
    }

    console.log("\n" + "=".repeat(50));
    console.log(`Round ${this.currentRound} Finished!`);

    let dealerWon = false;
    
    // Find discarder index for Head Bump logic
    let discarderIndex = -1;
    if (winType.toLowerCase() === "ron" && discardPlayerName) {
      discarderIndex = this.players.findIndex((p) => p.name === discardPlayerName);
    }

    // Determine who gets the riichi bets (Head Bump)
    let closestWinner = winners[0];
    if (winType.toLowerCase() === "ron" && discarderIndex !== -1 && winners.length > 1) {
      let minDistance = 5;
      for (const w of winners) {
        const idx = this.players.findIndex((p) => p.name === w.playerName);
        const dist = (idx - discarderIndex + this.numPlayers) % this.numPlayers;
        if (dist < minDistance) {
          minDistance = dist;
          closestWinner = w;
        }
      }
    }

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

      for (const w of winners) {
        const winner = this.players.find((p) => p.name === w.playerName);
        if (winner) {
          winner.score += w.points;
          discarder.score -= w.points;
          console.log(`${winner.name} won with Ron! ${discarder.name} pays ${w.points} points.`);
          if (winner.is_dealer) dealerWon = true;
          
          if (w === closestWinner && this.riichiBets > 0) {
            const riichiPoints = this.riichiBets * 1000;
            winner.score += riichiPoints;
            console.log(`${winner.name} receives ${this.riichiBets} riichi bets (${riichiPoints} points).`);
            this.riichiBets = 0;
          }
        }
      }
    } else if (winType.toLowerCase() === "tsumo") {
      const winnerData = winners[0];
      const winner = this.players.find((p) => p.name === winnerData.playerName);
      if (winner) {
        // Tsumo points logic: if dealer wins, all others pay equally.
        // If non-dealer wins, dealer pays more (approx half), others pay rest.
        // Since we get the TOTAL points here, we divide them (simplified).
        const pointsPerPlayer = Math.floor(winnerData.points / (this.numPlayers - 1));
        this.players.forEach((player) => {
          if (player.name !== winner.name) {
            player.score -= pointsPerPlayer;
            winner.score += pointsPerPlayer;
          }
        });
        console.log(`${winner.name} won with Tsumo! All other players pay ${pointsPerPlayer} points each.`);
        if (winner.is_dealer) dealerWon = true;
        
        if (this.riichiBets > 0) {
          const riichiPoints = this.riichiBets * 1000;
          winner.score += riichiPoints;
          console.log(`${winner.name} receives ${this.riichiBets} riichi bets (${riichiPoints} points).`);
          this.riichiBets = 0;
        }
      }
    } else {
      console.log("Invalid win type. Round ends without a winner.");
      return;
    }

    this._displayCurrentScores();

    if (!dealerWon) {
      this.dealerIndex = (this.dealerIndex + 1) % this.numPlayers;
      this.dealer = this.players[this.dealerIndex];
      console.log("Dealer has been rotated.");
      this._updatePlayerWinds();
      this.currentRound++;
    } else {
      console.log(`Dealer won, so they will be the dealer again for the next round (Renchan).`);
    }

    if ((this.currentRound - 1) % this.numPlayers === 0 && !dealerWon) {
      this._advancePrevalentWind();
    }
    this.gamePhase = "finished";
    this.doraIndicators = [];
    this.saveGameState();

    console.log("=".repeat(50));
  }

  declareRiichi(playerName: string): void {
    const player = this.players.find((p) => p.name === playerName);
    if (player) {
      if (player.score >= 1000) {
        player.score -= 1000;
        this.riichiBets++;
        console.log(`${player.name} declares Riichi! Bet placed.`);
        this.saveGameState();
      } else {
        console.log(`${player.name} does not have enough points to declare Riichi.`);
      }
    }
  }

  /**
   * Saves the current game state to localStorage.
   * Can optionally save to Firestore if userId is provided.
   */
  async saveGameState(userId?: string): Promise<void> {
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
      riichiBets: this.riichiBets,
      discards: Object.fromEntries(
        Object.entries(this.discards)
          .filter(([name]) => name && name.trim() !== "")
          .map(([name, tiles]) => [name, tiles.map(t => t.id)])
      ),
    };
    
    // Always save to localStorage as fallback
    localStorage.setItem("mahjongGameState", JSON.stringify(gameState));
    console.log("Game state saved to localStorage.");
    
    // If user is logged in, also save to Firestore
    if (userId) {
      try {
        const { firestoreService } = await import('@/services/firestoreService');
        await firestoreService.saveGameState(userId, gameState);
        console.log("Game state saved to Firestore.");
      } catch (error) {
        console.error("Failed to save to Firestore:", error);
      }
    }
  }

  /**
   * Loads game state from localStorage.
   */
  loadGameState(): boolean {
    const savedState = localStorage.getItem("mahjongGameState");
    if (savedState) {
      const gameState = JSON.parse(savedState);
      this.players = gameState.players.map((p: any, i: number) => {
        const playerName = p.name?.trim() ? p.name.trim() : `Player ${i + 1}`;
        const player = new Player(playerName, p.points);
        player.wind = p.wind;
        player.is_dealer = p.is_dealer;
        return player;
      });
      this.prevalentWind = gameState.prevalentWind;
      this.currentRound = gameState.currentRound;
      this.dealerIndex = gameState.dealerIndex;
      this.dealer = this.players[this.dealerIndex];
      this.gamePhase = gameState.gamePhase;
      this.doraIndicators = gameState.doraIndicators
        .map((name: string) => TILE_SET.get(name) || null)
        .filter((tile: MahjongTile | null) => tile !== null);

      this.riichiBets = gameState.riichiBets || 0;
      this.discards = {};
      this.players.forEach(p => this.discards[p.name] = []);
      if (gameState.discards) {
        for (const [name, tileIds] of Object.entries(gameState.discards)) {
          const validName = name.trim();
          if (validName && this.discards[validName] !== undefined) {
            this.discards[validName] = (tileIds as string[]).map(id => TILE_SET.get(id)!).filter(Boolean);
          }
        }
      }

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