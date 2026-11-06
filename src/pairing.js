import {COLORS} from './marks.js';
export const pairLabel=index=>String.fromCharCode(65+index);
const defaultMarks=['heart','spade','club','diamond','star','circle'];
const key=members=>[...members].sort().join('|');
// A pair owns two actual piece IDs, not the two edges of a former parent.
// There is no fixed pair-count limit (a future hexagon can supply six groups).
export function createPairs(groups,previous=[]) {
  const ids=groups.flat();
  if(new Set(ids).size!==ids.length)throw Error('ピースを複数のペアに重複登録できません');
  const existing=groups.map(members=>previous.find(p=>p.members&&key(p.members)===key(members)));
  const usedMarks=new Set(existing.filter(Boolean).map(p=>p.mark));
  const usedColors=new Set(existing.filter(Boolean).map(p=>p.color));
  return groups.map((members,index)=>{
    if(members.length!==2||members[0]===members[1])throw Error('ペアには異なる2ピースが必要です');
    const old=existing[index];
    const mark=old?.mark||defaultMarks.find(m=>!usedMarks.has(m))||defaultMarks[index%defaultMarks.length];
    const color=old?.color||COLORS.find(c=>!usedColors.has(c))||COLORS[index%COLORS.length];
    usedMarks.add(mark);usedColors.add(color);
    return {members:[...members],mark,color};
  });
}
