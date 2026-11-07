// Verified against ../hit-and-blow/access-counter.js and ../coin-shooting/access-counter.js.
// The opaque no-cors response is for recording only; it cannot supply a count.
export const ACCESS_CONFIG = Object.freeze({
  endpoint:'https://script.google.com/macros/s/AKfycbxssCIHsD-N97SHxNC_GN0ihYeC0qy-lb-EY0KmSs6Gnztaph1sITMerLVEnNWOGkYc/exec',
  app:'tiling-checker'
});

export function createAccessRecorder(send=globalThis.fetch,config=ACCESS_CONFIG) {
  let attempted=false;
  return function recordOnce() {
    if(attempted)return;
    attempted=true; // Set before calling fetch, including sync failures. No retries.
    try {
      const url=new URL(config.endpoint);
      url.searchParams.set('app',config.app);
      Promise.resolve(send(url.href,{
        method:'GET',mode:'no-cors',cache:'no-store',credentials:'omit',keepalive:true
      })).catch(()=>{});
    } catch {
      // Access logging must never affect drawing or interaction.
    }
  };
}

// One module instance per document. Reloading creates a fresh document/recorder.
export const recordAccessOnce=createAccessRecorder();
