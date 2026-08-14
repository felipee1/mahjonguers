import { describe, it, expect } from 'vitest';
import { analyzeMahjongHand } from '../hand_analyzer';
import { MAHJONG_TILES, Tile, Wind } from '../../types/game';

// Helper function to find a tile by ID
const getTile = (id: string): Tile => {
  const tile = MAHJONG_TILES.find(t => t.id === id);
  if (!tile) throw new Error(`Tile ${id} not found`);
  return tile;
};

describe('Mahjong Hand Analyzer', () => {
  it('should detect a basic Tanyao (All Simples) hand', () => {
    // 234m 567p 234s 88s (pair)
    const handTiles = [
      getTile('man-2'), getTile('man-3'), getTile('man-4'),
      getTile('pin-5'), getTile('pin-6'), getTile('pin-7'),
      getTile('sou-2'), getTile('sou-3'), getTile('sou-4'),
      getTile('sou-8'), getTile('sou-8'),
    ];
    // Winning on 8s to complete pair, wait, this needs to be 14 tiles total for winning
    // Wait, Tanyao needs 4 melds + 1 pair = 14 tiles
    const fullHandTiles = [
      ...handTiles,
      getTile('man-6'), getTile('man-7')
    ]; // 13 tiles
    
    const winningTile = getTile('man-8'); // winning with 8m to complete 678m

    const result = analyzeMahjongHand({
      handTiles: [...fullHandTiles, winningTile],
      doraTiles: [],
      uraDoraTiles: [],
      prevalentWind: 'east',
      seatWind: 'south',
      remainingTiles: 50,
      winningTile,
      isClosed: true,
      isTsumo: true
    });

    expect(result.error).toBeUndefined();
    expect(result.han_by_name).toHaveProperty('All Simples', 1);
  });

  it('should detect Pinfu', () => {
    // Pinfu requires:
    // - closed hand
    // - 4 chows
    // - pair is not dragon, not prevalent wind, not seat wind
    // - ryanmen (two-sided) wait
    
    // Hand: 234m 567p 234s 23s (waiting on 1s or 4s), pair of North (when prevalent=East, seat=South)
    const handTiles = [
      getTile('man-2'), getTile('man-3'), getTile('man-4'),
      getTile('pin-5'), getTile('pin-6'), getTile('pin-7'),
      getTile('sou-2'), getTile('sou-3'), getTile('sou-4'),
      getTile('honor-north'), getTile('honor-north'),
      getTile('sou-2'), getTile('sou-3')
    ];
    const winningTile = getTile('sou-4'); // completing 234s ryanmen wait

    const result = analyzeMahjongHand({
      handTiles: [...handTiles, winningTile],
      doraTiles: [],
      uraDoraTiles: [],
      prevalentWind: 'east',
      seatWind: 'south',
      remainingTiles: 50,
      winningTile,
      isClosed: true,
      isTsumo: false
    });

    expect(result.error).toBeUndefined();
    expect(result.han_by_name).toHaveProperty('Pinfu', 1);
  });

  it('should detect Yakuhai (Seat Wind)', () => {
    // Hand: South pung, 123m, 456p, 789s, pair 1s
    const handTiles = [
      getTile('honor-south'), getTile('honor-south'), getTile('honor-south'),
      getTile('man-1'), getTile('man-2'), getTile('man-3'),
      getTile('pin-4'), getTile('pin-5'), getTile('pin-6'),
      getTile('sou-7'), getTile('sou-8'), 
      getTile('sou-1'), getTile('sou-1')
    ];
    const winningTile = getTile('sou-9'); // completing 789s chow

    const result = analyzeMahjongHand({
      handTiles: [...handTiles, winningTile],
      doraTiles: [],
      uraDoraTiles: [],
      prevalentWind: 'east',
      seatWind: 'south', // Seat wind pung!
      remainingTiles: 50,
      winningTile,
      isClosed: true,
      isTsumo: false
    });
    console.log("Yakuhai result:", result);

    expect(result.error).toBeUndefined();
    expect(result.han_by_name).toHaveProperty('Yakuhai (南)', 1);
  });

  it('should detect Pure Straight (Ittsu)', () => {
    // 123m 456m 789m, 456p, 11s pair
    const handTiles = [
      getTile('man-1'), getTile('man-2'), getTile('man-3'),
      getTile('man-4'), getTile('man-5'), getTile('man-6'),
      getTile('man-7'), getTile('man-8'),
      getTile('pin-4'), getTile('pin-5'), getTile('pin-6'),
      getTile('sou-1'), getTile('sou-1')
    ];
    const winningTile = getTile('man-9');

    const result = analyzeMahjongHand({
      handTiles: [...handTiles, winningTile],
      doraTiles: [], uraDoraTiles: [],
      prevalentWind: 'east', seatWind: 'south',
      remainingTiles: 50,
      winningTile,
      isClosed: true, isTsumo: true
    });
    expect(result.han_by_name).toHaveProperty('Pure Straight', 2); // 2 han closed
  });

  it('should detect Mixed Triple Chow (Sanshoku Doujun)', () => {
    // 123m 123p 123s, 567p, 11s pair
    const handTiles = [
      getTile('man-1'), getTile('man-2'), getTile('man-3'),
      getTile('pin-1'), getTile('pin-2'), getTile('pin-3'),
      getTile('sou-1'), getTile('sou-2'), 
      getTile('pin-5'), getTile('pin-6'), getTile('pin-7'),
      getTile('sou-5'), getTile('sou-5')
    ];
    const winningTile = getTile('sou-3');

    const result = analyzeMahjongHand({
      handTiles: [...handTiles, winningTile],
      doraTiles: [], uraDoraTiles: [],
      prevalentWind: 'east', seatWind: 'south',
      remainingTiles: 50,
      winningTile,
      isClosed: true, isTsumo: true
    });
    expect(result.han_by_name).toHaveProperty('Mixed Triple Chow', 2); // 2 han closed
  });

  it('should detect Outside Hand (Chanta)', () => {
    // 123m 789m 123p 999p East East
    const handTiles = [
      getTile('man-1'), getTile('man-2'), getTile('man-3'),
      getTile('man-7'), getTile('man-8'), getTile('man-9'),
      getTile('pin-1'), getTile('pin-2'), 
      getTile('pin-9'), getTile('pin-9'), getTile('pin-9'),
      getTile('honor-east'), getTile('honor-east')
    ];
    const winningTile = getTile('pin-3');

    const result = analyzeMahjongHand({
      handTiles: [...handTiles, winningTile],
      doraTiles: [], uraDoraTiles: [],
      prevalentWind: 'east', seatWind: 'south',
      remainingTiles: 50,
      winningTile,
      isClosed: true, isTsumo: true
    });
    console.log("Chanta result:", result);
    expect(result.han_by_name).toHaveProperty('Outside Hand', 2); // 2 han closed
  });

  it('should detect Seven Pairs (Chiitoitsu)', () => {
    // 11m 22m 33m 44m 55m 66m 77m
    const handTiles = [
      getTile('man-1'), getTile('man-1'),
      getTile('man-2'), getTile('man-2'),
      getTile('man-3'), getTile('man-3'),
      getTile('man-4'), getTile('man-4'),
      getTile('man-5'), getTile('man-5'),
      getTile('man-6'), getTile('man-6'),
      getTile('man-7')
    ];
    const winningTile = getTile('man-7');

    const result = analyzeMahjongHand({
      handTiles: [...handTiles, winningTile],
      doraTiles: [], uraDoraTiles: [],
      prevalentWind: 'east', seatWind: 'south',
      remainingTiles: 50,
      winningTile,
      isClosed: true, isTsumo: true
    });
    expect(result.han_by_name).toHaveProperty('Seven Pairs', 2);
  });

  it('should detect Triple Pung (Sanankou)', () => {
    // 111m 222p 333s, 456m, 11s (3 concealed pungs)
    const handTiles = [
      getTile('man-1'), getTile('man-1'), getTile('man-1'),
      getTile('pin-2'), getTile('pin-2'), getTile('pin-2'),
      getTile('sou-3'), getTile('sou-3'), getTile('sou-3'),
      getTile('man-4'), getTile('man-5'),
      getTile('sou-1'), getTile('sou-1')
    ];
    const winningTile = getTile('man-6'); // completes the chow

    const result = analyzeMahjongHand({
      handTiles: [...handTiles, winningTile],
      doraTiles: [], uraDoraTiles: [],
      prevalentWind: 'east', seatWind: 'south',
      remainingTiles: 50,
      winningTile,
      isClosed: true, isTsumo: true // Tsumo means the pungs are concealed
    });
    // Sanankou = Three Concealed Pungs
    expect(result.han_by_name).toHaveProperty('Three Concealed Pungs', 2);
  });
});
