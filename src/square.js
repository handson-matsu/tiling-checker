import {profile} from './marks.js';
import {isBack} from './appearance.js';
import {edgeIntervals,interpolate} from './segments.js';
import {createPairs} from './pairing.js';

export const vertices = [[-100,-100],[100,-100],[100,100],[-100,100]];

export function assignments(layout) {
  const pairs = layout === 'opposite' ? [0,1,0,1] : [0,0,1,1];
  const seen = new Set();
  return pairs.map((pair,slot) => {
    const half = seen.has(pair) ? 'left' : 'right';
    seen.add(pair);
    return {pair,half,sourcePiece:`${pair}-${half}`,slot};
  });
}

export function squareStructure(mode=4,layout='opposite',origin=0) {
  if(![4,6,8].includes(mode))throw Error('ピース数は4・6・8を選んでください');
  const splitEdges=mode===8?[0,1,2,3]:mode===6?
    [origin,(origin+(layout==='opposite'?2:1))%4].sort((a,b)=>a-b):[];
  const raw=vertices.flatMap((_,edge)=>edgeIntervals(splitEdges.includes(edge)).map((interval,segment)=>({
    ...interval,edge,segment,id:`${edge}:${interval.start}-${interval.end}`
  }))).map((p,index)=>({...p,index}));
  let groups;
  if(mode===4){
    const edges=assignments(layout);
    groups=[0,1].map(pair=>edges.filter(p=>p.pair===pair).map(p=>raw[(p.slot+origin)%4].id));
  }else{
    groups=splitEdges.map(edge=>raw.filter(p=>p.edge===edge).map(p=>p.id));
    if(mode===6)groups.push(raw.filter(p=>!splitEdges.includes(p.edge)).map(p=>p.id));
  }
  return {raw,groups};
}

export function pieces(state) {
  const {raw,groups}=squareStructure(state.mode||4,state.layout,state.origin||0);
  const pairs=state.pairs[0]?.members?state.pairs:groups.map(members=>({members}));
  return raw.map(p=>{
    const pair=pairs.findIndex(group=>group.members.includes(p.id));
    if(pair<0)throw Error('ペアに属さないピースがあります');
    const half=pairs[pair].members.indexOf(p.id)===0?'right':'left';
    return {...p,pair,half,slot:p.edge,sourcePiece:p.id};
  });
}

export function configureSquare(state,{mode=state.mode||4,layout=state.layout,origin=state.origin||0}={}) {
  const old=pieces(state).map(p=>({...p,back:Boolean(state.backs[p.index])}));
  const {raw,groups}=squareStructure(mode,layout,origin);
  state.pairs=createPairs(groups,state.pairs);
  Object.assign(state,{mode,layout,origin});
  state.backs=raw.map(p=>(old.find(q=>q.id===p.id)||old.find(q=>q.edge===p.edge&&q.start<=p.start&&q.end>p.start))?.back||false);
}

export function pairPieces(state,firstId,secondId) {
  const all=pieces(state),a=all.find(p=>p.id===firstId),b=all.find(p=>p.id===secondId);
  if(!a||!b||a.id===b.id)return false;
  const aHalf=a.end-a.start<1,bHalf=b.end-b.start<1;
  if(aHalf||bHalf){
    if(!(aHalf&&bHalf&&a.edge===b.edge))return false;
  }
  if(a.pair===b.pair)return true;
  const groupA=state.pairs[a.pair],groupB=state.pairs[b.pair];
  const otherA=groupA.members.find(id=>id!==a.id),otherB=groupB.members.find(id=>id!==b.id);
  groupA.members=[a.id,b.id];groupB.members=[otherA,otherB];
  if((state.mode||4)===4){
    const edges=state.pairs[0].members.map(id=>all.find(p=>p.id===id).edge);
    const difference=(edges[1]-edges[0]+4)%4;
    state.layout=difference===2?'opposite':'adjacent';
    state.origin=difference===3?edges[1]:edges[0];
  }
  return true;
}

export function pieceEnds(piece) {
  const a=vertices[piece.edge],b=vertices[(piece.edge+1)%4];
  return [interpolate(a,b,piece.start),interpolate(a,b,piece.end)];
}

export function piecePolygon(piece) {
  return [[0,0],...pieceEnds(piece)];
}

export function splitLines(state) {
  const lines=vertices.map(vertex=>[[0,0],vertex]);
  for(let edge=0;edge<4;edge++) {
    if(pieces(state).filter(p=>p.edge===edge).length===2)
      lines.push([[0,0],interpolate(vertices[edge],vertices[(edge+1)%4],.5)]);
  }
  return lines;
}

export function setLayout(state,layout) {
  configureSquare(state,{layout});
}

export function pieceMark(state,piece) {
  const half=isBack(state,piece.index)
    ? (piece.half==='right'?'left':'right') : piece.half;
  const [a,b]=pieceEnds(piece),direction=half==='right'?-1:1;
  return {...piece,half,mark:state.pairs[piece.pair].mark,
    axis:[direction*(b[0]-a[0]),direction*(b[1]-a[1])]};
}

export function pieceMarkPoints(state,piece) {
  const [a,b]=pieceEnds(piece),mark=pieceMark(state,piece);
  return profile(mark.mark).map(([x,y])=>{
    const roundOrStar=['circle','star'].includes(mark.mark);
    const span=roundOrStar?.5:mark.mark==='heart'?.7:.8;
    const t=(1-span)/2+span*(mark.half==='right'?1-y:y);
    const depth=(roundOrStar?.5:mark.mark==='heart'?.30:.35)*x;
    return [a[0]+(b[0]-a[0])*t-(b[1]-a[1])*depth,
      a[1]+(b[1]-a[1])*t+(b[0]-a[0])*depth];
  });
}

// Compatibility helpers for the original whole-edge API.
export function edgeMark(state,index) {
  return pieceMark(state,pieces(state).find(p=>p.edge===index));
}
export function markPoints(state,index) {
  return pieceMarkPoints(state,pieces(state).find(p=>p.edge===index));
}

export function initialTiles() {
  return Array.from({length:16},(_,i) => ({
    x:(i%4)*200,y:Math.floor(i/4)*200,rotation:0,flip:false
  }));
}
