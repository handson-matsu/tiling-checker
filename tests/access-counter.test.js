import test from 'node:test';
import assert from 'node:assert/strict';
import {ACCESS_CONFIG,createAccessRecorder} from '../src/access-counter.js';
test('access is sent once per document recorder with the verified GET contract',async()=>{
 const calls=[];const record=createAccessRecorder((url,options)=>{calls.push({url,options});return Promise.resolve();});
 record();record();record();await Promise.resolve();assert.equal(calls.length,1);
 const url=new URL(calls[0].url);assert.equal(url.origin,'https://script.google.com');assert.equal(url.pathname,new URL(ACCESS_CONFIG.endpoint).pathname);assert.equal(url.searchParams.get('app'),'tiling-checker');
 assert.equal(JSON.stringify(calls[0].options),JSON.stringify({method:'GET',mode:'no-cors',cache:'no-store',credentials:'omit',keepalive:true}));
});
test('async network failure is swallowed and not retried',async()=>{
 let count=0;const record=createAccessRecorder(()=>{count++;return Promise.reject(Error('offline'));});record();await Promise.resolve();record();assert.equal(count,1);
});
test('synchronous fetch error cannot block app and is not retried',()=>{
 let count=0;const record=createAccessRecorder(()=>{count++;throw Error('blocked');});assert.doesNotThrow(record);record();assert.equal(count,1);
});
test('a fresh page recorder records a fresh visit',()=>{
 let count=0;const send=()=>{count++;return Promise.resolve();};const first=createAccessRecorder(send);first();first();const reloaded=createAccessRecorder(send);reloaded();reloaded();assert.equal(count,2);
});
