const K = 1000;
export const M = 1000 * K;
const G = 1000 * M;
const T = 1000 * G;
const P = 1000 * T;
export default function formatValue(value = 0, fix = 2) {
  fix = Math.pow(10, fix);
  if (value < K) return Math.round(value  * fix / 1) / fix;
  if (value < M) return Math.round(value  * fix / K) / fix  + 'K';
  if (value < G) return Math.round(value  * fix / M) / fix  + 'M';
  if (value < T) return Math.round(value  * fix / G) / fix  + 'G';
  if (value < P) return Math.round(value  * fix / T) / fix  + 'T';
  return Math.round(value  * fix / P) / fix  + 'P';
}

export function formatValueFromMax(max = 0,value = 0, fix = 2) {
  fix = Math.pow(10, fix);
  if (max < K) return Math.round(value  * fix / 1) / fix;
  if (max < M) return Math.round(value  * fix / K) / fix  + 'K';
  if (max < G) return Math.round(value  * fix / M) / fix  + 'M';
  if (max < T) return Math.round(value  * fix / G) / fix  + 'G';
  if (max < P) return Math.round(value  * fix / T) / fix  + 'T';
  return Math.round(value  * fix / P) / fix  + 'P';
}

export const Kb = 1024;
export const Mb = Kb * 1024;
export const Gb = Mb * 1024;
export const Tb = 1024 * Gb;
export const Pb = 1024 * Tb;
export function formatByte(value = 0, fix = 2) {
  fix = Math.pow(10, fix);
  if (value < Kb) return Math.round(value  * fix / 1) / fix;
  if (value < Mb) return Math.round(value  * fix / Kb) / fix  + 'KB';
  if (value < Gb) return Math.round(value  * fix / Mb) / fix  + 'MB';
  if (value < Tb) return Math.round(value  * fix / Gb) / fix  + 'GB';
  if (value < Pb) return Math.round(value  * fix / Tb) / fix  + 'TB';
  return Math.round(value  * fix / Pb) / fix  + 'PB';
}
export function formatByteFromMax(max = 0,value = 0, fix = 2) {
  fix = Math.pow(10, fix);
  if (max < Kb) return Math.round(value  * fix / 1) / fix;
  if (max < Mb) return Math.round(value  * fix / Kb) / fix  + 'KB';
  if (max < Gb) return Math.round(value  * fix / Mb) / fix  + 'MB';
  if (max < Tb) return Math.round(value  * fix / Gb) / fix  + 'GB';
  if (max < Pb) return Math.round(value  * fix / Tb) / fix  + 'TB';
  return Math.round(value  * fix / Pb) / fix  + 'PB';
}