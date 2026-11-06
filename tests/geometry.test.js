import test from 'node:test';
import assert from 'node:assert/strict';
import {MARKS,vertices,profile,assignments,edgeMark,markPoints,worldEdges,marksMatch,checkTiling,initialTiles,transform} from '../src/geometry.js';
const state=()=>({layout:'opposite',pairs:[{mark:'heart',color:'#ee7385'},{mark:'spade',color:'#689fe5'}],backs:[false,false,false,false]});

test('all halves have endpoints on the vertical cut axis',()=>{
  for(const mark of Object.keys(MARKS)){
    const p=profile(mark);assert.equal(p[0][0],0);assert.equal(p.at(-1)[0],0);
    assert(p.every(([x])=>x>=0));
  }
});
test('pair assignments retain one left and one right source piece',()=>{
  for(const layout of ['opposite','adjacent']) for(const pair of [0,1]){
    const a=assignments(layout).filter(e=>e.pair===pair);
    assert.deepEqual(a.map(e=>e.half),['right','left']);
    assert.equal(new Set(a.map(e=>e.sourcePiece)).size,2);
  }
});
test('every mark remains inside its paper triangle and cut endpoints lie on its edge',()=>{
  for(const mark of Object.keys(MARKS)) for(const back of [false,true]){
    const s=state();s.pairs.forEach(p=>p.mark=mark);s.backs.fill(back);
    for(let i=0;i<4;i++){
      const p=markPoints(s,i),a=vertices[i],b=vertices[(i+1)%4];
      for(const [x,y]of p){assert(Math.abs(x)<=100.001&&Math.abs(y)<=100.001);const inward=i===0?-y:i===1?x:i===2?y:-x;const tangent=i%2?y:x;assert(inward>=Math.abs(tangent)-.001);}
      for(const q of [p[0],p.at(-1)]) assert(Math.abs((b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]))<.001);
    }
  }
});
test('default board has 24 matching seams',()=>{const r=checkTiling(state(),initialTiles());assert.equal(r.length,24);assert(r.every(e=>e.match));});
test('all four mark types form complete symbols on default seams',()=>{
  for(const mark of Object.keys(MARKS)){const s=state();s.pairs.forEach(p=>p.mark=mark);assert(checkTiling(s,initialTiles()).every(e=>e.match));}
});
test('different mark names are rejected',()=>{const s=state(),t=initialTiles();const a=worldEdges(s,t[0])[1];s.pairs[1].mark='club';assert.equal(marksMatch(a,worldEdges(s,t[1])[3]),false);});
test('piece reflection swaps left and right, preserves source identity',()=>{const s=state(),a=edgeMark(s,0);s.backs[0]=true;const b=edgeMark(s,0);assert.notEqual(a.half,b.half);assert.equal(a.sourcePiece,b.sourcePiece);assert.deepEqual(a.axis,b.axis.map(v=>-v));assert(checkTiling(s,initialTiles()).some(r=>!r.match));s.backs[2]=true;assert(checkTiling(s,initialTiles()).every(r=>r.match));});
test('identical half identities are rejected, even for a symmetric diamond',()=>{const s=state();s.pairs[1].mark='diamond';const t=initialTiles(),a=worldEdges(s,t[0])[1],b=worldEdges(s,t[1])[3];assert(marksMatch(a,b));assert.equal(marksMatch(a,{...b,half:a.half}),false);});
test('opposite top-to-bottom directions do not form one mark',()=>{const s=state(),t=initialTiles(),a=worldEdges(s,t[0])[1],b=worldEdges(s,t[1])[3];assert.equal(marksMatch(a,{...b,axis:b.axis.map(v=>-v)}),false);});
test('color does not affect mark geometry or matching',()=>{const s=state(),before=markPoints(s,0);s.pairs[0].color='#123456';assert.deepEqual(markPoints(s,0),before);assert(checkTiling(s,initialTiles()).every(e=>e.match));});
test('tile rotation preserves square footprint and reflection swaps half identities',()=>{const s=state();for(let rotation=0;rotation<4;rotation++)for(const flip of [false,true]){const t={rotation,flip};assert.deepEqual(vertices.map(p=>transform(p,t)).map(p=>p.join(',')).sort(),vertices.map(p=>p.join(',')).sort());const a=worldEdges(s,{rotation,flip:false})[0],b=worldEdges(s,{rotation,flip:true})[0];assert.notEqual(a.half,b.half);}});
test('a globally rotated or reflected board still matches all seams',()=>{const s=state();for(const rotation of [0,1,2,3])for(const flip of [false,true]){const tiles=initialTiles().map(t=>{const [x,y]=transform([t.x,t.y],{rotation,flip});return {...t,x,y,rotation,flip};});const r=checkTiling(s,tiles);assert.equal(r.length,24);assert(r.every(e=>e.match));}});
test('independent tile transforms retain 24 seams and expose mismatches',()=>{const tiles=initialTiles();tiles.forEach((t,i)=>{t.rotation=i%4;t.flip=i%3===0;});const r=checkTiling(state(),tiles);assert.equal(r.length,24);assert(r.some(e=>!e.match));});
