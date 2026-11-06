import {vertices,pieces,pieceEnds,pieceMark,pieceMarkPoints} from './square.js';
export {MARKS,COLORS,profile} from './marks.js';
export {vertices,assignments,edgeMark,markPoints,pieces,pieceEnds,piecePolygon,splitLines,squareStructure,configureSquare,pairPieces,setLayout,pieceMark,pieceMarkPoints,initialTiles} from './square.js';

export const path = points => points.map((p,i) =>
  `${i?'L':'M'}${p[0].toFixed(4)},${p[1].toFixed(4)}`).join(' ')+' Z';

export function transform(p,tile) {
  let x = tile.flip ? -p[0] : p[0], y = p[1];
  for(let i=0;i<((tile.rotation%4)+4)%4;i++) [x,y]=[-y,x];
  return [x+(tile.x||0),y+(tile.y||0)];
}

export function worldEdges(state,tile) {
  const all=pieces(state);
  return vertices.map((_,index)=>{
    const marks=all.filter(p=>p.edge===index).map(piece=>{
      const mark=pieceMark(state,piece);
      const origin=transform([0,0],tile),end=transform(mark.axis,tile);
      return {index,piece:piece.index,mark:mark.mark,
        half:tile.flip?(mark.half==='right'?'left':'right'):mark.half,
        axis:[end[0]-origin[0],end[1]-origin[1]],
        points:pieceMarkPoints(state,piece).map(p=>transform(p,tile)),
        ends:pieceEnds(piece).map(p=>transform(p,tile))};
    });
    const ends=[vertices[index],vertices[(index+1)%4]].map(p=>transform(p,tile));
    return marks.length===1?marks[0]:{index,ends,segments:marks};
  });
}

const near = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1])<.001;
export function sameBoundary(a,b) {
  return (near(a.ends[0],b.ends[1])&&near(a.ends[1],b.ends[0])) ||
    (near(a.ends[0],b.ends[0])&&near(a.ends[1],b.ends[1]));
}

// The reflected colored half must have the same actual contour on the other
// side of the cut axis, as well as complementary identity and direction.
function halfMarksMatch(a,b) {
  if(!sameBoundary(a,b)||a.mark!==b.mark||a.half===b.half||!near(a.axis,b.axis))return false;
  const [u,v]=a.ends,dx=v[0]-u[0],dy=v[1]-u[1],length2=dx*dx+dy*dy;
  if(!length2||a.points.length!==b.points.length)return false;
  return a.points.every((p,i)=>{
    const t=((p[0]-u[0])*dx+(p[1]-u[1])*dy)/length2;
    return near([2*(u[0]+t*dx)-p[0],2*(u[1]+t*dy)-p[1]],b.points[i]);
  });
}

export function marksMatch(a,b) {
  if(!sameBoundary(a,b))return false;
  const left=a.segments||[a],right=b.segments||[b];
  return left.length===right.length && left.every(mark=>
    right.some(other=>halfMarksMatch(mark,other)));
}

export function checkTiling(state,tiles) {
  const edges=tiles.map(t=>worldEdges(state,t)), results=[];
  for(let i=0;i<tiles.length;i++) for(let j=i+1;j<tiles.length;j++)
    for(const a of edges[i]) for(const b of edges[j])
      if(sameBoundary(a,b)) results.push({i,j,a,b,match:marksMatch(a,b)});
  return results;
}
