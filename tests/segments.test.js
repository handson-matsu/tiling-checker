import test from 'node:test';
import assert from 'node:assert/strict';
import {squareStructure,configureSquare,pairPieces,pieces,pieceEnds,piecePolygon,pieceMark,pieceMarkPoints,splitLines,worldEdges,marksMatch,checkTiling,initialTiles,transform} from '../src/geometry.js';
import {createPairs} from '../src/pairing.js';
import {pieceAppearance} from '../src/appearance.js';
const initial=()=>({mode:4,layout:'opposite',origin:0,pairs:createPairs(squareStructure().groups),backs:[false,false,false,false],backColor:true});
const configured=(mode,layout='opposite',origin=0)=>{const s=initial();configureSquare(s,{mode,layout,origin});return s;};
const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
test('4/6/8 modes contain exactly 2/3/4 disjoint pairs of two pieces',()=>{
 for(const mode of [4,6,8])for(const layout of ['opposite','adjacent'])for(let origin=0;origin<4;origin++){
  const s=configured(mode,layout,origin);assert.equal(pieces(s).length,mode);assert.equal(s.backs.length,mode);assert.equal(s.pairs.length,mode/2);assert(s.pairs.every(p=>p.members.length===2));assert.equal(new Set(s.pairs.flatMap(p=>p.members)).size,mode);
 }
});
test('six-piece upper/lower split creates independent A/B pairs and remaining C pair',()=>{
 const s=configured(6);assert.deepEqual(s.pairs.map(p=>p.members.map(id=>pieces(s).find(p=>p.id===id).edge)),[[0,0],[2,2],[1,3]]);assert.equal(new Set(s.pairs.map(p=>p.mark)).size,3);assert.equal(new Set(s.pairs.map(p=>p.color)).size,3);
 s.pairs[0].mark='star';assert.notEqual(s.pairs[1].mark,'star');
});
test('eight-piece mode pairs both intervals of each edge, with complementary halves',()=>{
 const s=configured(8);for(let edge=0;edge<4;edge++){
  const members=pieces(s).filter(p=>p.edge===edge);assert.equal(members[0].pair,members[1].pair);assert.deepEqual(members.map(p=>p.half),['right','left']);assert.equal(members[0].end,members[1].start);
 }assert.equal(new Set(s.pairs.map(p=>p.mark)).size,4);
});
test('switching from six to eight preserves existing pairs and assigns distinct new defaults',()=>{
 const s=configured(6);s.pairs[0].color='#123456';configureSquare(s,{mode:8});assert.equal(s.pairs[0].color,'#123456');assert.equal(new Set(s.pairs.map(p=>p.mark)).size,4);
});
test('opposite/adjacent and origin cover every possible six-piece split arrangement',()=>{
 const choices=new Set();for(const layout of ['opposite','adjacent'])for(let origin=0;origin<4;origin++)choices.add(pieces(configured(6,layout,origin)).filter(p=>p.segment===1).map(p=>p.edge).sort().join(','));assert.equal(choices.size,6);
});
test('cut lines retain diagonals and add exactly the required edge midpoints',()=>{
 for(const mode of [4,6,8]){const lines=splitLines(configured(mode));assert.equal(lines.length,mode);assert.deepEqual(lines.slice(0,4).map(l=>l[1]),[[-100,-100],[100,-100],[100,100],[-100,100]]);for(const l of lines.slice(4))assert.equal(l[1].filter(v=>v===0).length,1);}
});
test('pieces partition the square without changing its area',()=>{
 for(const mode of [4,6,8])assert.equal(pieces(configured(mode)).reduce((a,p)=>{const [c,u,v]=piecePolygon(p);return a+Math.abs(cross(c,u,v))/2;},0),40000);
});
test('all six marks fit their actual piece and put cut endpoints on the edge interval',()=>{
 for(const mode of [4,6,8])for(const name of ['heart','spade','club','diamond','star','circle'])for(const back of [false,true]){
  const s=configured(mode);s.pairs.forEach(p=>p.mark=name);s.backs.fill(back);
  for(const p of pieces(s)){const polygon=piecePolygon(p),points=pieceMarkPoints(s,p),ends=pieceEnds(p);for(const point of points)for(let k=0;k<3;k++)assert(cross(polygon[k],polygon[(k+1)%3],point)>=-.001,`${name} does not fit`);for(const point of [points[0],points.at(-1)])assert(Math.abs(cross(...ends,point))<.001);}
 }
});
test('whole and split modes can form 24 matching seams when actual symbols agree',()=>{
 for(const mode of [4,6,8])for(const mark of ['heart','spade','club','diamond','star','circle']){const s=configured(mode);s.pairs.forEach(p=>p.mark=mark);assert(checkTiling(s,initialTiles()).every(r=>r.match));}
});
test('different independent symbols on opposite split edges produce mismatches',()=>{
 const s=configured(6);const result=checkTiling(s,initialTiles());assert.equal(result.filter(r=>r.match).length,12);assert.equal(result.filter(r=>!r.match).length,12);
});
test('independent face toggle changes only one piece and whole-tile flip changes all',()=>{
 const s=configured(8),all=pieces(s),before=all.map(p=>pieceMarkPoints(s,p));s.backs[0]=true;
 assert.notDeepEqual(pieceMarkPoints(s,all[0]),before[0]);for(let i=1;i<8;i++)assert.deepEqual(pieceMarkPoints(s,all[i]),before[i]);
 assert.equal(pieceAppearance(s,0,{}).background,'#DCE2E6');assert.equal(pieceAppearance(s,1,{}).background,'#FFFFFF');all.forEach(p=>assert.notEqual(pieceAppearance(s,p.index,{}).back,pieceAppearance(s,p.index,{flip:true}).back));
});
test('normal versus split boundary is rejected even for identical symbol names',()=>{
 const s=configured(6);s.pairs.forEach(p=>p.mark='circle');const tiles=initialTiles();tiles[0].rotation=1;assert(checkTiling(s,tiles).some(r=>Boolean(r.a.segments)!==Boolean(r.b.segments)&&!r.match));
});
test('matching uses reflected contour and physical interval position',()=>{
 const s=configured(8);s.pairs.forEach(p=>p.mark='star');const t=initialTiles(),a=worldEdges(s,t[0])[1],b=worldEdges(s,t[1])[3];assert(marksMatch(a,b));const altered=structuredClone(b);altered.segments[0].points[2][0]+=1;assert.equal(marksMatch(a,altered),false);const shifted=structuredClone(b);shifted.segments[0].ends[0][1]+=2;assert.equal(marksMatch(a,shifted),false);
});
test('two flips restore exact appearance/geometry and rotations preserve faces',()=>{
 for(const mode of [4,6,8]){const s=configured(mode);s.backs=s.backs.map((_,i)=>i%2===0);const t={...initialTiles()[0],rotation:1},before=worldEdges(s,t),colors=pieces(s).map(p=>pieceAppearance(s,p.index,t));t.flip=!t.flip;t.flip=!t.flip;assert.deepEqual(worldEdges(s,t),before);assert.deepEqual(pieces(s).map(p=>pieceAppearance(s,p.index,t)),colors);t.rotation=2;assert.deepEqual(pieces(s).map(p=>pieceAppearance(s,p.index,t)),colors);}
});
test('common rotations and reflection preserve valid split board seams',()=>{
 for(const mode of [4,6,8])for(const rotation of [0,1,2,3])for(const flip of [false,true]){const s=configured(mode);s.pairs.forEach(p=>p.mark='circle');const t=initialTiles().map(t=>{const [x,y]=transform([t.x,t.y],{rotation,flip});return {...t,x,y,rotation,flip};});assert(checkTiling(s,t).every(r=>r.match));}
});
test('diagram re-pairing preserves two members per pair without losing faces',()=>{
 const s=initial();s.backs[0]=true;const p=pieces(s);assert(pairPieces(s,p[0].id,p[1].id));assert.equal(pieces(s)[0].pair,pieces(s)[1].pair);assert.deepEqual(s.backs,[true,false,false,false]);assert.equal(new Set(s.pairs.flatMap(p=>p.members)).size,4);
});
test('diagram rejects cross-edge split pairs and normal/split pairs',()=>{
 const s=configured(6),p=pieces(s),before=JSON.stringify(s.pairs);assert.equal(pairPieces(s,p[0].id,p[3].id),false);assert.equal(pairPieces(s,p[0].id,p[2].id),false);assert.equal(JSON.stringify(s.pairs),before);assert(pairPieces(s,p[0].id,p[1].id));
});
test('generic pairing supports the future six-pair capacity',()=>{
 const pairs=createPairs(Array.from({length:6},(_,i)=>[`${i}:L`,`${i}:R`]));assert.equal(pairs.length,6);assert.equal(new Set(pairs.map(p=>p.mark)).size,6);assert.throws(()=>createPairs([['x','y'],['x','z']]));
});
test('sub-pieces inherit faces and merging retains the first interval',()=>{
 const s=initial();s.backs[0]=true;configureSquare(s,{mode:6});assert.deepEqual(s.backs.slice(0,2),[true,true]);s.backs[1]=false;configureSquare(s,{mode:4});assert.equal(s.backs[0],true);
});
test('circle has equal physical width and height when assembled from two halves',()=>{
 const s=initial();s.pairs[0].mark='circle';const points=pieceMarkPoints(s,pieces(s)[0]),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);assert(Math.abs((Math.max(...xs)-Math.min(...xs))-2*(Math.max(...ys)-Math.min(...ys)))<.001);
});
