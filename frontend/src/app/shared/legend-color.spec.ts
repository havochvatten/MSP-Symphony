import { colorForValue } from './legend-color';

describe('colorForValue', () => {
  // Synthetic legend, not a palette
  const map = [
    { color: '#000000', quantity: 1 },
    { color: '#ffffff', quantity: 5 },
    { color: '#ff0000', quantity: 100 }
  ];

  it('uses the first colour below the first stop', () => {
    expect(colorForValue(map, 0)).toBe('#000000');
    expect(colorForValue(map, 0.4)).toBe('#000000');
  });

  it('uses the top colour at and above the last stop', () => {
    expect(colorForValue(map, 100)).toBe('#ff0000');
    expect(colorForValue(map, 140)).toBe('#ff0000');
  });

  it('returns the stop colour exactly at a stop', () => {
    expect(colorForValue(map, 5)).toBe('#ffffff');
  });

  it('interpolates between stops like the map ramp', () => {
    expect(colorForValue(map, 3)).toBe('#808080');
  });
});
