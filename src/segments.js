// Shape-independent normalized boundary intervals. A piece owns one interval;
// all geometry, face controls and seam checks use these same interval records.
export function edgeIntervals(split=false) {
  return split ? [{start:0,end:.5},{start:.5,end:1}] : [{start:0,end:1}];
}
export const interpolate = (a,b,t) => [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
