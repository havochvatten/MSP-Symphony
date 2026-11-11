import { LegendColor } from '@data/calculation/calculation.interfaces';

/**
 * The colour a smooth (ramp) map draws for a value, from a served legend: the first colour at or below the
 * first stop, the top colour at or above the last, otherwise linear RGB interpolation between the stops.
 */
export function colorForValue(colorMap: LegendColor[], value: number): string {
  const first = colorMap[0];
  const last = colorMap[colorMap.length - 1];
  if (value <= first.quantity) return first.color;
  if (value >= last.quantity) return last.color;

  const upper = colorMap.findIndex((entry) => entry.quantity >= value);
  const a = colorMap[upper - 1];
  const b = colorMap[upper];
  const t = (value - a.quantity) / (b.quantity - a.quantity);
  const [ra, ga, ba] = rgb(a.color);
  const [rb, gb, bb] = rgb(b.color);
  return hex(ra + (rb - ra) * t, ga + (gb - ga) * t, ba + (bb - ba) * t);
}

function rgb(color: string): [number, number, number] {
  const n = parseInt(color.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function hex(...channels: number[]): string {
  return '#' + channels.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}
