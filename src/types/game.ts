// All static asset imports must be done here.
// Vite will handle the path resolution for you during the build.
import Man1 from '@/assets/Man1.png';
import Man2 from '@/assets/Man2.png';
import Man3 from '@/assets/Man3.png';
import Man4 from '@/assets/Man4.png';
import Man5 from '@/assets/Man5.png';
import Man6 from '@/assets/Man6.png';
import Man7 from '@/assets/Man7.png';
import Man8 from '@/assets/Man8.png';
import Man9 from '@/assets/Man9.png';

import Pin1 from '@/assets/Pin1.png';
import Pin2 from '@/assets/Pin2.png';
import Pin3 from '@/assets/Pin3.png';
import Pin4 from '@/assets/Pin4.png';
import Pin5 from '@/assets/Pin5.png';
import Pin6 from '@/assets/Pin6.png';
import Pin7 from '@/assets/Pin7.png';
import Pin8 from '@/assets/Pin8.png';
import Pin9 from '@/assets/Pin9.png';

import Sou1 from '@/assets/Sou1.png';
import Sou2 from '@/assets/Sou2.png';
import Sou3 from '@/assets/Sou3.png';
import Sou4 from '@/assets/Sou4.png';
import Sou5 from '@/assets/Sou5.png';
import Sou6 from '@/assets/Sou6.png';
import Sou7 from '@/assets/Sou7.png';
import Sou8 from '@/assets/Sou8.png';
import Sou9 from '@/assets/Sou9.png';

import Chun from '@/assets/Chun.png';
import Haku from '@/assets/Haku.png';
import Hatsu from '@/assets/Hatsu.png';
import Nan from '@/assets/Nan.png';
import Pei from '@/assets/Pei.png';
import Sha from '@/assets/Shaa.png';
import Ton from '@/assets/Ton.png';

import Man5Dora from '@/assets/Man5-Dora.png';
import Pin5Dora from '@/assets/Pin5-Dora.png';
import Sou5Dora from '@/assets/Sou5-Dora.png';


// A mapping object to easily access the imported image URLs
const TILE_IMAGE_MAP: Record<string, string> = {
  // Man
  'man-1': Man1, 'man-2': Man2, 'man-3': Man3, 'man-4': Man4, 'man-5': Man5,
  'man-6': Man6, 'man-7': Man7, 'man-8': Man8, 'man-9': Man9,
  // Pin
  'pin-1': Pin1, 'pin-2': Pin2, 'pin-3': Pin3, 'pin-4': Pin4, 'pin-5': Pin5,
  'pin-6': Pin6, 'pin-7': Pin7, 'pin-8': Pin8, 'pin-9': Pin9,
  // Sou
  'sou-1': Sou1, 'sou-2': Sou2, 'sou-3': Sou3, 'sou-4': Sou4, 'sou-5': Sou5,
  'sou-6': Sou6, 'sou-7': Sou7, 'sou-8': Sou8, 'sou-9': Sou9,
  // Honor Tiles
  'honor-east': Ton, 'honor-south': Nan, 'honor-west': Sha, 'honor-north': Pei,
  'honor-white': Haku, 'honor-green': Hatsu, 'honor-red': Chun,
  // Dora Tiles
  'man-5-dora': Man5Dora, 'pin-5-dora': Pin5Dora, 'sou-5-dora': Sou5Dora,
};

export type Wind = 'east' | 'south' | 'west' | 'north';

export class Player {
  name: string;
  score: number;
  wind: Wind | null;
  is_dealer: boolean;

  /**
   * Represents a single player in the match.
   */
  constructor(name: string, startingPoints: number = 25000) {
    this.name = name;
    this.score = startingPoints;
    this.wind = null;
    this.is_dealer = false;
  }

  toString(): string {
    return `${this.name} (${this.score} pts, Wind: ${this.wind})`;
  }
}

export interface Tile {
  id: string;
  type: 'man' | 'pin' | 'sou' | 'honor';
  value: number | string;
  display?: string;
  is_red?: boolean;
  imageUrl?: string;
}

export class MahjongTile implements Tile {
  id: string;
  type: 'man' | 'pin' | 'sou' | 'honor';
  value: number | string;
  display?: string;
  is_red?: boolean;
  imageUrl?: string;

  /**
   * Represents a single Mahjong tile.
   *
   * @param tile The Tile object to use for initialization.
   */
  constructor(tile: Tile) {
    this.id = tile.id;
    this.type = tile.type;
    this.value = tile.value;
    this.display = tile.display;
    this.is_red = tile.is_red;
    this.imageUrl = tile.imageUrl;
  }

  toString(): string {
    if (this.is_red) {
      return `Red ${this.display}`;
    }
    return this.display || this.id;
  }

  equals(other: MahjongTile): boolean {
    if (!(other instanceof MahjongTile)) {
      return false;
    }
    return this.id === other.id;
  }
}

export interface GameState {
  players: Player[];
  currentRound: number;
  dealer: Wind;
  doras: MahjongTile[];
  gamePhase: 'setup' | 'playing' | 'finished';
  currentWinner?: string;
  currentAction?: 'ron' | 'tsumo' | 'kan';
}

export interface ScoringOptions {
  isRiichi: boolean;
  isDoubleRiichi: boolean;
  tilesLeft: number;
  isFirstRound: boolean;
  afterKan: boolean;
  robbingKan: boolean;
}

// Predefined tiles for dropdown selection
export const MAHJONG_TILES: Tile[] = [
  // Man (Characters) 1-9
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `man-${i + 1}`,
    type: 'man' as const,
    value: i + 1,
    display: `${i + 1}万`,
    imageUrl: TILE_IMAGE_MAP[`man-${i + 1}`],
  })),
  // Pin (Circles) 1-9
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `pin-${i + 1}`,
    type: 'pin' as const,
    value: i + 1,
    display: `${i + 1}筒`,
    imageUrl: TILE_IMAGE_MAP[`pin-${i + 1}`],
  })),
  // Sou (Bamboo) 1-9
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `sou-${i + 1}`,
    type: 'sou' as const,
    value: i + 1,
    display: `${i + 1}索`,
    imageUrl: TILE_IMAGE_MAP[`sou-${i + 1}`],
  })),
  // Honor tiles
  { id: 'sou-5-dora', type: 'sou', value: 'dora', display: '5索' ,imageUrl: TILE_IMAGE_MAP['sou-5-dora']},
  { id: 'pin-5-dora', type: 'pin', value: 'dora', display: '5筒' ,imageUrl: TILE_IMAGE_MAP['pin-5-dora']},
  { id: 'man-5-dora', type: 'man', value: 'dora', display: '5万' ,imageUrl: TILE_IMAGE_MAP['man-5-dora']},
  { id: 'honor-east', type: 'honor', value: 'east', display: '東' ,imageUrl: TILE_IMAGE_MAP['honor-east']},
  { id: 'honor-south', type: 'honor', value: 'south', display: '南' ,imageUrl: TILE_IMAGE_MAP['honor-south']},
  { id: 'honor-west', type: 'honor', value: 'west', display: '西' ,imageUrl: TILE_IMAGE_MAP['honor-west']},
  { id: 'honor-north', type: 'honor', value: 'north', display: '北' ,imageUrl: TILE_IMAGE_MAP['honor-north']},
  { id: 'honor-white', type: 'honor', value: 'white', display: '白' ,imageUrl: TILE_IMAGE_MAP['honor-white']},
  { id: 'honor-green', type: 'honor', value: 'green', display: '發' ,imageUrl: TILE_IMAGE_MAP['honor-green']},
  { id: 'honor-red', type: 'honor', value: 'red', display: '中',imageUrl: TILE_IMAGE_MAP['honor-red']},
];

export const MAHJONG_CLASS_IDS = [
  "1B", "1C", "1D", "1F", "1S", "2B", "2C", "2D", "2F", "2S", "3B", "3C", "3D", "3F", "3S", "4B", "4C", "4D", "4F", "4S", "5B", "5C", "5D", "6B", "6C", "6D", "7B", "7C", "7D", "8B", "8C", "8D", "9B", "9C", "9D", "EW", "GD", "NW", "RD", "SW", "WD", "WW",
];


// Define the mapping from the detection tileCode to the internal tile ID.
const TILE_CODE_TO_ID_MAP: { [key: string]: string } = {
  // Sou (Bamboo)
  '1B': 'sou-1', '2B': 'sou-2', '3B': 'sou-3', '4B': 'sou-4', '5B': 'sou-5',
  '6B': 'sou-6', '7B': 'sou-7', '8B': 'sou-8', '9B': 'sou-9',
  // Pin (Circles)
  '1D': 'pin-1', '2D': 'pin-2', '3D': 'pin-3', '4D': 'pin-4', '5D': 'pin-5',
  '6D': 'pin-6', '7D': 'pin-7', '8D': 'pin-8', '9D': 'pin-9',
  // Man (Characters)
  '1C': 'man-1', '2C': 'man-2', '3C': 'man-3', '4C': 'man-4', '5C': 'man-5',
  '6C': 'man-6', '7C': 'man-7', '8C': 'man-8', '9C': 'man-9',
  // Honor Tiles
  'EW': 'honor-east', 'SW': 'honor-south', 'WW': 'honor-west', 'NW': 'honor-north',
  'WD': 'honor-white', 'GD': 'honor-green', 'RD': 'honor-red',
};


/**
 * Parses an array of detected tile objects and transforms them into a
 * structured array of Mahjong Tile objects.
 */
export function parseDetectionsToTiles(detections: { tileCode: string; confidence: string; }[]): Tile[] {
  const resultTiles: Tile[] = [];

  const tileLookup = new Map<string, Tile>();
  MAHJONG_TILES.forEach(tile => {
    tileLookup.set(tile.id, tile);
  });

  for (const detection of detections) {
    const tileId = TILE_CODE_TO_ID_MAP[detection.tileCode];
    if (tileId && tileLookup.has(tileId)) {
      const tile = tileLookup.get(tileId);
      if (tile) {
        resultTiles.push(tile);
      }
    } else {
      console.warn(`Could not find a mapping for tileCode: ${detection.tileCode}`);
    }
  }

  return resultTiles;
}