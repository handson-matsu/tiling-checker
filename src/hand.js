import {transform} from './geometry.js';

// Palm facing the viewer, index up, thumb protruding on the left. Height 58
// against a tile edge of 200 (~30%). The tile group applies the only transform.
export const HAND_PARTS = [
  {tag:'path',attrs:{d:'M-8,28 L-8,20 Q-15,16 -18,9 L-25,-2 Q-28,-7 -23,-9 Q-20,-11 -17,-6 L-11,1 L-11,-25 Q-11,-30 -6,-30 Q-1,-30 -1,-25 L-1,-7 Q2,-12 6,-9 Q8,-8 8,-5 Q12,-10 16,-6 L17,-2 Q23,-4 23,2 L23,10 Q23,18 16,22 L16,28 Z'}},
  {tag:'path',attrs:{d:'M-9,4 Q-4,7 -3,12',fill:'none','stroke-width':1.2}}
];
export const HAND_LANDMARKS={index:[-6,-30],thumb:[-25,-5],wrist:[4,28]};
export function handLandmarks(tile){
  return Object.fromEntries(Object.entries(HAND_LANDMARKS).map(([name,p])=>[name,transform(p,tile)]));
}
export function handAppearance(tile){
  return tile.flip?{fill:'#B7D9E8',stroke:'#37677E'}:{fill:'#F5C49B',stroke:'#825433'};
}
export function tileTransform(tile){
  return `translate(${tile.x||0} ${tile.y||0}) rotate(${tile.rotation*90}) scale(${tile.flip?-1:1} 1)`;
}
