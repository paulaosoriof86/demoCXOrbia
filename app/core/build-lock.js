/* CXOrbia source lock runtime V174 Corte 2A 20260722 */
var CX_SOURCE_LOCK={
  "manifestFile": "docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json",
  "aggregateSha256": "0969b56ef0ab031c663220a8ec8fa6ca2c18c8b7ee22e419202d0f26d62c631d",
  "fileCount": 1886,
  "generatedAt": "2026-07-22",
  "candidateSha256": "e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f",
  "packageSha256": "e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f",
  "headBefore": "0fd63faf2a873640e042421c40749714a4d12fd4",
  "empalmeCommit": "b21e494d127fb4b902de5576e3fab0292362b097",
  "status": "V174_FUNCTIONAL_EMPALMED_GATE_HOLD_NO_DEPLOY",
  "note": "BUILD_ID = primeros 16 hex del aggregateSha256; calculado sobre app/ excluyendo build-lock y el manifest V174."
};
var CX_BUILD_ID=CX_SOURCE_LOCK.aggregateSha256.slice(0,16);
if(typeof window!=='undefined'){window.CX=window.CX||{};window.CX.BUILD_ID=CX_BUILD_ID;window.CX.SOURCE_LOCK=CX_SOURCE_LOCK;}
