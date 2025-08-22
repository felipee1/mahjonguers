// --- Mahjong Game Objects ---
import { MAHJONG_TILES, Tile, Wind } from "@/types/game";

/**
 * Represents a single Mahjong tile, based on the shared `Tile` interface.
 * This class is necessary to maintain the `compareTo` and `equals` logic
 * which is not present on the raw `Tile` interface.
 */
class MahjongTile {
  constructor(
    public id: string,
    public suit: string,
    public value: number | string,
    public name: string,
    public is_red_five: boolean = false
  ) {}

  /**
   * @returns {string}
   */
  toString(): string {
    if (this.is_red_five) {
      return `Red ${this.name}`;
    }
    return this.name;
  }

  /**
   * @param {MahjongTile} other
   * @returns {boolean}
   */
  equals(other: any): boolean {
    if (!(other instanceof MahjongTile)) {
      return false;
    }
    return (
      this.id === other.id
    );
  }

  /**
   * @param {MahjongTile} other
   * @returns {number}
   */
  compareTo(other: MahjongTile): number {
    const suitOrder: { [key: string]: number } = {
      man: 0,
      pin: 1,
      sou: 2,
      honor: 3,
    };
    const suitDiff = suitOrder[this.suit] - suitOrder[other.suit];
    if (suitDiff !== 0) {
      return suitDiff;
    }
    // Handle number values for comparison
    const thisValue = typeof this.value === 'number' ? this.value : 0;
    const otherValue = typeof other.value === 'number' ? other.value : 0;
    return thisValue - otherValue;
  }
}

/**
 * Creates a mapping from the shared `Tile` interface to the internal `MahjongTile` class.
 */
function createMahjongTileFromSharedTile(tile: Tile): MahjongTile {
  const is_red_five = tile.is_red || false;
  return new MahjongTile(
    tile.id,
    tile.type,
    tile.value,
    tile.display || tile.id,
    is_red_five
  );
}

// Map the shared tiles to the internal MahjongTile class for internal logic.
const TILE_SET = new Map<string, MahjongTile>(
  MAHJONG_TILES.map((tile) => [tile.id, createMahjongTileFromSharedTile(tile)])
);

const SPECIAL_PUNCTUATION: {
  [key: string]: { 0: number; 1: number };
} = {
  mangan: { 0: 8000, 1: 12000 },
  haneman: { 0: 12000, 1: 18000 },
  baiman: { 0: 16000, 1: 24000 },
  sanbaiman: { 0: 24000, 1: 36000 },
  yakuman: { 0: 32000, 1: 48000 },
};

const TERMINAL_TILES = new Set<MahjongTile | undefined>([
  TILE_SET.get("man-1"),
  TILE_SET.get("man-9"),
  TILE_SET.get("pin-1"),
  TILE_SET.get("pin-9"),
  TILE_SET.get("sou-1"),
  TILE_SET.get("sou-9"),
]);
const HONOR_TILES = new Set<MahjongTile | undefined>([
  TILE_SET.get("honor-east"),
  TILE_SET.get("honor-south"),
  TILE_SET.get("honor-west"),
  TILE_SET.get("honor-north"),
  TILE_SET.get("honor-white"),
  TILE_SET.get("honor-green"),
  TILE_SET.get("honor-red"),
]);
const WIND_TILES = new Set<MahjongTile | undefined>([
  TILE_SET.get("honor-east"),
  TILE_SET.get("honor-south"),
  TILE_SET.get("honor-west"),
  TILE_SET.get("honor-north"),
]);
const DRAGON_TILES = new Set<MahjongTile | undefined>([
  TILE_SET.get("honor-white"),
  TILE_SET.get("honor-green"),
  TILE_SET.get("honor-red"),
]);
const TERMINAL_AND_HONOR = new Set<MahjongTile | undefined>([
  ...TERMINAL_TILES,
  ...HONOR_TILES,
]);

/**
 * @param {MahjongTile} tile
 * @returns {boolean}
 */
function isHonor(tile: MahjongTile): boolean {
  return HONOR_TILES.has(tile);
}

/**
 * @param {MahjongTile} tile
 * @returns {boolean}
 */
function isTerminal(tile: MahjongTile): boolean {
  return TERMINAL_TILES.has(tile);
}

/**
 * @param {MahjongTile} tile
 * @returns {boolean}
 */
function isSimple(tile: MahjongTile): boolean {
  return !(isHonor(tile) || isTerminal(tile));
}

/**
 * Recursively finds all possible 4-meld-1-pair combinations.
 * @param {Map<MahjongTile, number>} tilesCounts
 * @returns {Array<Array>}
 */
function findMelds(
  tilesCounts: Map<MahjongTile, number>
): [any[], any[]][] {
  const tiles = Array.from(tilesCounts.keys())
    .filter((tile) => (tilesCounts.get(tile) || 0) > 0)
    .sort((a, b) => a.compareTo(b));
  if (tiles.length === 0) {
    return [[[], []]];
  }

  const firstTile = tiles[0];
  const results: [any[], any[]][] = [];

  // Case 1: Try to form a Pung (triplet)
  if ((tilesCounts.get(firstTile) || 0) >= 3) {
    const newCounts = new Map(tilesCounts);
    newCounts.set(firstTile, newCounts.get(firstTile)! - 3);
    const subResults = findMelds(newCounts);
    for (const [melds, pair] of subResults) {
      results.push([["pung", firstTile, ...melds], pair]);
    }
  }

  // Case 2: Try to form a Chow (sequence)
  if (
    ["man", "pin", "sou"].includes(firstTile.suit) &&
    typeof firstTile.value === 'number' &&
    firstTile.value < 8
  ) {
    const nextTile = TILE_SET.get(`${firstTile.suit}-${firstTile.value + 1}`);
    const nextNextTile = TILE_SET.get(`${firstTile.suit}-${firstTile.value + 2}`);

    if (
      nextTile &&
      nextNextTile &&
      (tilesCounts.get(firstTile) || 0) >= 1 &&
      (tilesCounts.get(nextTile) || 0) >= 1 &&
      (tilesCounts.get(nextNextTile) || 0) >= 1
    ) {
      const newCounts = new Map(tilesCounts);
      newCounts.set(firstTile, newCounts.get(firstTile)! - 1);
      newCounts.set(nextTile, newCounts.get(nextTile)! - 1);
      newCounts.set(nextNextTile, newCounts.get(nextNextTile)! - 1);
      const subResults = findMelds(newCounts);
      for (const [melds, pair] of subResults) {
        results.push([
          ["chow", firstTile, nextTile, nextNextTile, ...melds],
          pair,
        ]);
      }
    }
  }

  // Case 3: Skip the first tile (handles "orphan" tiles that are not part of a meld)
  const newCounts = new Map(tilesCounts);
  newCounts.set(firstTile, newCounts.get(firstTile)! - 1);
  const subResults = findMelds(newCounts);
  for (const [melds, pair] of subResults) {
    results.push([melds, pair]);
  }

  return results;
}

/**
 * Finds all valid 4-meld-1-pair combinations.
 * @param {MahjongTile[]} handTiles
 * @returns {Array<Array>}
 */
function getAllMeldCombos(handTiles: MahjongTile[]): any[][] {
  const tilesCounts = new Map<MahjongTile, number>();
  for (const tile of handTiles) {
    tilesCounts.set(tile, (tilesCounts.get(tile) || 0) + 1);
  }
  const allCombos: any[][] = [];

  for (const [tile, count] of tilesCounts.entries()) {
    if (count >= 2) {
      const tempCounts = new Map(tilesCounts);
      tempCounts.set(tile, tempCounts.get(tile)! - 2);

      const validMeldsAndPair = findMelds(tempCounts);
      for (const [melds, pair] of validMeldsAndPair) {
        allCombos.push([melds, ["pair", tile]]);
      }
    }
  }
  return allCombos;
}

/**
 * Calculates the fu value of the hand.
 * @param {Array} meldsAndPair
 * @param {MahjongTile} winningTile
 * @param {MahjongTile} prevalentWind
 * @param {MahjongTile} seatWind
 * @param {boolean} isTsumo
 * @param {boolean} isPinfuCompatible
 * @param {boolean} isClosed
 * @returns {number}
 */
function calculateFu(
  meldsAndPair: any[],
  winningTile: MahjongTile,
  prevalentWind: MahjongTile,
  seatWind: MahjongTile,
  isTsumo: boolean,
  isPinfuCompatible: boolean,
  isClosed: boolean
): number {
  if (isPinfuCompatible) {
    return isTsumo ? 20 : 30;
  }

  let fu;
  if (isClosed) {
    fu = isTsumo ? 20 : 30;
  } else {
    fu = 20;
  }

  const [melds, pair] = meldsAndPair;
  for (let i = 0; i < melds.length; i += 2) {
    const meldType = melds[i];
    const tile = melds[i + 1];
    if (meldType === "pung") {
      if (TERMINAL_AND_HONOR.has(tile)) {
        fu += isClosed ? 8 : 4;
      } else {
        fu += isClosed ? 4 : 2;
      }
    }
  }

  const pairTile = pair[1];
  if (
    DRAGON_TILES.has(pairTile) ||
    pairTile.equals(prevalentWind) ||
    pairTile.equals(seatWind)
  ) {
    fu += 2;
  }

  if (pairTile.equals(winningTile)) {
    // Tanki wait
    fu += 2;
  }

  if (fu % 10 !== 0) {
    fu = Math.ceil(fu / 10) * 10;
  }

  return fu;
}

/**
 * Maps a Dora indicator tile to the actual Dora tile.
 * @param {MahjongTile} indicatorTile
 * @returns {MahjongTile | null}
 */
function getDoraTile(indicatorTile: MahjongTile): MahjongTile | undefined {
  if (["man", "pin", "sou"].includes(indicatorTile.suit)) {
    if ((indicatorTile.value as number) === 9) {
      return TILE_SET.get(`${indicatorTile.suit}-1`);
    }
    return TILE_SET.get(`${indicatorTile.suit}-${(indicatorTile.value as number) + 1}`);
  } else if (indicatorTile.suit === "honor") {
    const windOrder = ["honor-east", "honor-south", "honor-west", "honor-north"];
    const dragonOrder = ["honor-white", "honor-green", "honor-red"];

    if (windOrder.includes(indicatorTile.id)) {
      const currentIndex = windOrder.indexOf(indicatorTile.id);
      const nextIndex = (currentIndex + 1) % windOrder.length;
      return TILE_SET.get(windOrder[nextIndex]);
    }
    if (dragonOrder.includes(indicatorTile.id)) {
      const currentIndex = dragonOrder.indexOf(indicatorTile.id);
      const nextIndex = (currentIndex + 1) % dragonOrder.length;
      return TILE_SET.get(dragonOrder[nextIndex]);
    }
  }
  return undefined;
}

/**
 * Identifies all yaku and yakuman.
 * @param {MahjongTile[]} handTiles
 * @param {MahjongTile[]} doraIndicators
 * @param {MahjongTile} prevalentWind
 * @param {MahjongTile} seatWind
 * @param {MahjongTile} winningTile
 * @param {boolean} isTsumo
 * @param {boolean} isRiichi
 * @param {boolean} isDoubleRiichi
 * @param {boolean} isFirstTurnWin
 * @param {boolean} isFirstTurnForPlayer
 * @param {number} remainingTiles
 * @param {Array | null} meldsAndPair
 * @param {boolean} isClosed
 * @param {boolean} isDealer
 * @returns {object}
 */
function getYaku(
  handTiles: MahjongTile[],
  doraIndicators: MahjongTile[],
  uraDoraIndicators: MahjongTile[],
  prevalentWind: MahjongTile,
  seatWind: MahjongTile,
  winningTile: MahjongTile,
  isTsumo: boolean,
  isRiichi: boolean,
  isDoubleRiichi: boolean,
  isFirstTurnWin: boolean,
  isFirstTurnForPlayer: boolean,
  remainingTiles: number,
  meldsAndPair: any[] | null,
  isClosed: boolean,
  isDealer: boolean
): Record<string, number> {
  let yaku: Record<string, number> = {};

  // --- Yakuman & Double Yakuman Checks ---
  if (isFirstTurnWin) {
    yaku[isDealer ? "Blessing of Heaven" : "Blessing of Earth"] = 13;
    return yaku;
  }

  const handCounts = new Map<MahjongTile, number>();
  for (const tile of handTiles) {
    handCounts.set(tile, (handCounts.get(tile) || 0) + 1);
  }
  const uniqueOrphanTiles = new Set<MahjongTile>(handCounts.keys());

  const is13OrphansWait =
    handTiles.length === 13 &&
    [...uniqueOrphanTiles].every((t) => TERMINAL_AND_HONOR.has(t));
  const isComplete13Orphans =
    handTiles.length === 14 &&
    uniqueOrphanTiles.size === 13 &&
    [...uniqueOrphanTiles].every((t) => TERMINAL_AND_HONOR.has(t)) &&
    [...TERMINAL_AND_HONOR].some((t) => (handCounts.get(t) || 0) === 2);

  if (is13OrphansWait) {
    yaku["Thirteen Orphans (13-sided wait)"] = 26;
    return yaku;
  } else if (isComplete13Orphans) {
    yaku["Thirteen Orphans"] = 13;
    return yaku;
  }

  if ([...handTiles].every((t) => HONOR_TILES.has(t))) {
    yaku["All Honors"] = 13;
    return yaku;
  }

  // Handle melds-based yakuman
  if (meldsAndPair) {
    const [melds] = meldsAndPair;
    const windPungs = melds.filter(
      (item: string, index: number) =>
        index % 2 === 0 && item === "pung" && WIND_TILES.has(melds[index + 1])
    );
    if (windPungs.length === 4) {
      yaku["Four Pungs of Winds"] = 26;
      return yaku;
    }
  }

  if (!meldsAndPair) {
    return yaku;
  }
  const [melds, pair] = meldsAndPair;

  // --- Han-based Yaku Checks ---
  if (isDoubleRiichi && isClosed && isFirstTurnForPlayer) {
    yaku["Double Riichi"] = 2;
  } else if (isRiichi && isClosed) {
    yaku["Riichi"] = 1;
  }

  if (isTsumo && isClosed) {
    yaku["Menzen Tsumo"] = 1;
  }

  const isPinfu =
    isClosed &&
    melds.filter((m: string) => m === "chow").length === 4 &&
    !(
      DRAGON_TILES.has(pair[1]) ||
      pair[1].equals(prevalentWind) ||
      pair[1].equals(seatWind)
    );
  
  if (isPinfu) {
  let hasRyanmenWait = false;
  const chowTiles = [];
  for (let i = 0; i < melds.length; i += 4) {
    if (melds[i] === "chow") {
      chowTiles.push([melds[i + 1], melds[i + 2], melds[i + 3]]);
    }
  }

  for (const chow of chowTiles) {
    const sortedChow = chow.sort((a: MahjongTile, b: MahjongTile) => a.compareTo(b));
    if (winningTile.equals(sortedChow[1])) {
      // It's a two-sided wait if the winning tile is the middle tile of the chow.
      // E.g., winning with 5 to complete a 4-5-6.
      hasRyanmenWait = true;
      break;
    }
  }

  if (hasRyanmenWait) {
    yaku["Pinfu"] = 1;
  }
}

  if ([...handTiles].every((t) => isSimple(t))) {
    yaku["All Simples"] = 1;
  }

  const windPungsSeat = melds.filter(
    (item: string, index: number) =>
      index % 2 === 0 && item === "pung" && melds[index + 1].equals(seatWind)
  );
  if (windPungsSeat.length > 0) {
    yaku[`Yakuhai (${seatWind.name})`] = windPungsSeat.length;
  }
  const windPungsPrevalent = melds.filter(
    (item: string, index: number) =>
      index % 2 === 0 &&
      item === "pung" &&
      melds[index + 1].equals(prevalentWind) &&
      !melds[index + 1].equals(seatWind)
  );
  if (windPungsPrevalent.length > 0) {
    yaku[`Yakuhai (${prevalentWind.name})`] = windPungsPrevalent.length;
  }
  const dragonPungs = melds.filter(
    (item: string, index: number) =>
      index % 2 === 0 && item === "pung" && DRAGON_TILES.has(melds[index + 1])
  );
  if (dragonPungs.length > 0) {
    yaku["Yakuhai (dragons)"] = dragonPungs.length;
  }

  if (isClosed) {
    const chows = [];
    for (let i = 0; i < melds.length; i += 4) {
      if (melds[i] === "chow") {
        chows.push(
          [melds[i + 1], melds[i + 2], melds[i + 3]].sort((a, b) =>
            a.compareTo(b)
          )
        );
      }
    }
    if (new Set(chows.map((c) => JSON.stringify(c))).size < chows.length) {
      yaku["Iipeikou"] = 1;
    }
  }

  const suits = new Set(
    [...handTiles].filter((t) => t.suit !== 'honor').map((t) => t.suit)
  );
  if (suits.size === 1) {
    if ([...handTiles].some((t) => isHonor(t))) {
      yaku["Honitsu"] = isClosed ? 3 : 2;
    } else {
      yaku["Chinitsu"] = isClosed ? 6 : 5;
    }
  }

  if (remainingTiles === 0) {
    yaku[isTsumo ? "Under the Sea" : "Under the River"] = 1;
  }

  let doraCount = 0;
  const doraTilesSet = new Set<MahjongTile | undefined>();
  for (const indicator of doraIndicators) {
    const doraTile = getDoraTile(indicator);
    if (doraTile) doraTilesSet.add(doraTile);
  }
  for (const tile of handTiles) {
    if (tile.is_red_five) doraCount++;
    if (doraTilesSet.has(tile)) doraCount++;
  }
  if (doraCount > 0) {
    yaku["Dora"] = doraCount;
  }
  let uraDoraCount = 0;
  const uraDoraTilesSet = new Set<MahjongTile | undefined>();
  for (const indicator of uraDoraIndicators) {
    const uraDoraTile = getDoraTile(indicator);
    if (uraDoraTile) {
      uraDoraTilesSet.add(uraDoraTile);
    }
  }
  for (const tile of handTiles) {
    if (uraDoraTilesSet.has(tile)) {
      uraDoraCount++;
    }
  }
  if (uraDoraCount > 0) {
    yaku["Ura Dora"] = uraDoraCount;
  }

  const yakuHanCount = Object.entries(yaku).reduce(
    (sum, [key, value]) =>
      sum + (key !== "Dora" && key !== "Ura Dora" ? value : 0),
    0
  );
  if (yakuHanCount === 0 && doraCount > 0) {
    yaku = {};
  }

  return yaku;
}

/**
 * Calculates the final points based on fu and han.
 * @param {number} fu
 * @param {number} han
 * @param {boolean} isDealer
 * @returns {number}
 */
function calculateTotalPoints(fu: number, han: number, isDealer: boolean): number {
  if (han >= 13) return SPECIAL_PUNCTUATION.yakuman[isDealer ? 1 : 0];
  if (han >= 11) return SPECIAL_PUNCTUATION.sanbaiman[isDealer ? 1 : 0];
  if (han >= 8) return SPECIAL_PUNCTUATION.baiman[isDealer ? 1 : 0];
  if (han >= 6) return SPECIAL_PUNCTUATION.haneman[isDealer ? 1 : 0];
  if (han >= 5) return SPECIAL_PUNCTUATION.mangan[isDealer ? 1 : 0];

  const basePoints = fu * 4;
  if (han === 0) return 0;
  const points = basePoints * 2 ** (han + 2);
  return isDealer ? points : points;
}

/**
 * Analyzes a winning Riichi Mahjong hand and calculates its score.
 * @param {Tile[]} handTiles
 * @param {Tile[]} doraTiles
 * @param {Wind} prevalentWind
 * @param {Wind} seatWind
 * @param {Tile} winningTile
 * @param {boolean} [isTsumo=true]
 * @param {boolean} [isRiichi=false]
 * @param {boolean} [isDoubleRiichi=false]
 * @param {boolean} [isFirstTurnWin=false]
 * @param {boolean} [isFirstTurnForPlayer=false]
 * @param {number} remainingTiles
 * @param {boolean} [isClosed=true]
 * @param {boolean} [isDealer=false]
 * @returns {object}
 */
export function analyzeMahjongHand({
  handTiles,
  doraTiles,
  uraDoraTiles,
  prevalentWind,
  seatWind,
  remainingTiles,
  winningTile,
  isRiichi = false,
  isDoubleRiichi = false,
  isTsumo = true,
  isClosed = true,
  isDealer = false,
  isFirstTurnWin = false,
  isFirstTurnForPlayer = false
}: {
  handTiles: Tile[];
  doraTiles: Tile[];
  uraDoraTiles: Tile[];
  prevalentWind: Wind;
  seatWind: Wind;
  remainingTiles: number;
  winningTile: Tile;
  isRiichi?: boolean;
  isDoubleRiichi?: boolean;
  isTsumo?: boolean;
  isClosed?: boolean;
  isDealer?: boolean;
  isFirstTurnWin?: boolean;
  isFirstTurnForPlayer?: boolean;
}): {
  error?: string;
  han_by_name?: Record<string, number>;
  total_fu?: number;
  total_han?: number;
  total_points?: number;
} {
  // ... the rest of the function code remains the same

  // Input validation checks
  if (isDoubleRiichi && !isRiichi)
    return {
      error: "Invalid combination: Double Riichi must be used with Riichi.",
    };
  if (isDoubleRiichi && !isFirstTurnForPlayer)
    return {
      error:
        "Invalid combination: Double Riichi must be on the first draw of the player.",
    };
  if (isRiichi && !isClosed)
    return {
      error:
        "Invalid combination: Riichi can only be declared on a closed hand.",
    };
  if (isFirstTurnWin && (isRiichi || isDoubleRiichi))
    return {
      error:
        "Invalid combination: First turn win (Tenhou/Chiihou) is a different yaku and cannot be combined with Riichi.",
    };
  if (
    isTsumo &&
    !isClosed &&
    !handTiles.some(
      (tile) => isTerminal(TILE_SET.get(tile.id)!) || isHonor(TILE_SET.get(tile.id)!)
    )
  )
    return {
      error:
        "Invalid combination: Open Tsumo hands must have a scoring element that is not a simple tile (e.g., Yakuhai, Toitoi, etc.).",
    };

  const handMahjongTiles = handTiles
    .map((tile) => TILE_SET.get(tile.id))
    .filter((t) => t !== undefined) as MahjongTile[];
  const doraMahjongTiles = doraTiles
    .map((tile) => TILE_SET.get(tile.id))
    .filter((t) => t !== undefined) as MahjongTile[];
  const uraDoraMahjongTiles = uraDoraTiles
    .map((tile) => TILE_SET.get(tile.id))
    .filter((t) => t !== undefined) as MahjongTile[];
  const winningMahjongTile = TILE_SET.get(winningTile.id) as MahjongTile;
  const prevalentWindTile = TILE_SET.get(`honor-${prevalentWind}`) as MahjongTile;
  const seatWindTile = TILE_SET.get(`honor-${seatWind}`) as MahjongTile;

  const yakuDict = getYaku(
    handMahjongTiles,
    doraMahjongTiles as MahjongTile[],
    uraDoraMahjongTiles as MahjongTile[],
    prevalentWindTile as MahjongTile,
    seatWindTile as MahjongTile,
    winningMahjongTile,
    isTsumo,
    isRiichi,
    isDoubleRiichi,
    isFirstTurnWin,
    isFirstTurnForPlayer,
    remainingTiles,
    null,
    isClosed,
    isDealer
  );

  const totalHan = Object.values(yakuDict).reduce((sum, han) => sum + han, 0);
  if (totalHan >= 13) {
    return {
      han_by_name: yakuDict,
      total_fu: 0,
      total_han: totalHan,
      total_points: calculateTotalPoints(0, totalHan, isDealer),
    };
  }

  const handCounts = new Map<MahjongTile, number>();
  for (const tile of handMahjongTiles) {
    handCounts.set(tile, (handCounts.get(tile) || 0) + 1);
  }
  const isSevenPairs =
    handCounts.size === 7 && [...handCounts.values()].every((c) => c === 2);
  if (isSevenPairs) {
    const yakuDict = { "Seven Pairs": 2 };
    const fu = 25;
    const totalHan = Object.values(yakuDict).reduce((sum, han) => sum + han, 0);
    const totalPoints = calculateTotalPoints(fu, totalHan, isDealer);
    return {
      han_by_name: yakuDict,
      total_fu: fu,
      total_han: totalHan,
      total_points: totalPoints,
    };
  }

  const possibleMelds = getAllMeldCombos(handMahjongTiles);
  if (possibleMelds.length === 0) {
    return { error: "Invalid winning hand structure (no 4-meld-1-pair)." };
  }

  const meldsAndPair = possibleMelds[0];
  const finalYakuDict = getYaku(
    handMahjongTiles,
    doraMahjongTiles as MahjongTile[],
    prevalentWindTile as MahjongTile,
    seatWindTile as MahjongTile,
    winningMahjongTile,
    isTsumo,
    isRiichi,
    isDoubleRiichi,
    isFirstTurnWin,
    isFirstTurnForPlayer,
    remainingTiles,
    meldsAndPair,
    isClosed,
    isDealer
  );

  const isPinfuCompatible = finalYakuDict.hasOwnProperty("Pinfu");
  const fu = calculateFu(
    meldsAndPair,
    winningMahjongTile,
    prevalentWindTile as MahjongTile,
    seatWindTile as MahjongTile,
    isTsumo,
    isPinfuCompatible,
    isClosed
  );
  const finalHan = Object.values(finalYakuDict).reduce(
    (sum, han) => sum + han,
    0
  );
  const finalPoints = calculateTotalPoints(fu, finalHan, isDealer);

  return {
    han_by_name: finalYakuDict,
    total_fu: fu,
    total_han: finalHan,
    total_points: finalPoints,
  };
}