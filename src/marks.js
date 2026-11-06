// All profiles are right halves of vertically symmetric marks, from top to bottom.
// x=0 is the cut axis, which lies exactly on the polygon edge.
export const MARKS = {
 heart:{name:'ハート',curves:[[0,.18,.36,-.08,.85,.02,.76,.4],[.76,.4,.68,.65,.23,.88,0,1]]},
 spade:{name:'スペード',curves:[[0,0,.2,.2,.85,.45,.72,.65],[.72,.65,.6,.85,.2,.78,.13,.72],[.13,.72,.12,.86,.23,.95,.28,1],[.28,1,.18,1,.08,1,0,1]]},
 club:{name:'クローバー',curves:[[0,0,.52,-.04,.6,.28,.24,.37],[.24,.37,.9,.16,1,.78,.38,.76],[.38,.76,.18,.75,.12,.65,.12,.66],[.12,.66,.1,.86,.2,.95,.28,1],[.28,1,.18,1,.08,1,0,1]]},
 star:{name:'星（五芒星）',outline:[[0,0],[.124,.382],[.526,.382],[.201,.618],[.325,1],[0,.764]]},
 circle:{name:'丸（円）',curves:[[0,0,.276142,0,.5,.223858,.5,.5],[.5,.5,.5,.776142,.276142,1,0,1]]},
 diamond:{name:'ダイヤ',curves:[[0,0,.2,.2,.48,.42,.65,.5],[.65,.5,.48,.58,.2,.8,0,1]]}
};
export const COLORS=['#ee7385','#689fe5','#70ba94','#e6b451','#a58add','#62bfc6','#ec9668','#b39987'];
export function profile(mark){if(MARKS[mark].outline)return MARKS[mark].outline.map(p=>[...p]);const out=[];for(const c of MARKS[mark].curves){for(let i=out.length?1:0;i<=24;i++){const t=i/24,u=1-t;out.push([u*u*u*c[0]+3*u*u*t*c[2]+3*u*t*t*c[4]+t*t*t*c[6],u*u*u*c[1]+3*u*u*t*c[3]+3*u*t*t*c[5]+t*t*t*c[7]]);}}return out;}
