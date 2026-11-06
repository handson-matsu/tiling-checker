// A whole-tile reflection turns over every physical paper piece. Rotation does
// not change its face. Both the preview and board use this single resolver.
export function isBack(state,index,tile={}) {
  return Boolean(state.backs[index]) !== Boolean(tile.flip);
}

function lighten(hex) {
  return '#'+hex.slice(1).match(/../g).map(c=>
    Math.round(parseInt(c,16)*.45+255*.55).toString(16).padStart(2,'0')).join('');
}

export function pieceAppearance(state,index,tile,color='#000000') {
  const back=isBack(state,index,tile);
  const tinted=state.backColor && back;
  return {back,background:tinted?'#DCE2E6':'#FFFFFF',
    markColor:tinted?lighten(color):color,label:back?'裏':'表'};
}
