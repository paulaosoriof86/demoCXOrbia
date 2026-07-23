/* CXOrbia source lock runtime V174 Corte 2A R20 source identity fix */
var CX_SOURCE_LOCK={
  "manifestFile": "docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json",
  "aggregateSha256": "ab11bc47dfd096cbe6a110db250c46e656c2dc9760ad832c07958b6c9a886818",
  "fileCount": 1895,
  "generatedAt": "2026-07-23T16:45:21.090Z",
  "candidateSha256": "e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f",
  "packageSha256": "e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f",
  "headBefore": "0fd63faf2a873640e042421c40749714a4d12fd4",
  "empalmeCommit": "b21e494d127fb4b902de5576e3fab0292362b097",
  "holdFixCommit": "0acdc6772f2d4a7743dea0992a4279241dcb79d7",
  "r20SourceIdentityFixCommits": [
    "396efcf3cc98fb196a756067ef23dba13f348f61",
    "d78f4f79821755ec705a7ef7aacdf8a1f2fcbc20"
  ],
  "sourceAccessMode": "public_gviz_gid_verified_inventory",
  "status": "V174_R20_SOURCE_IDENTITY_FIX_PENDING_FINAL_GATES",
  "note": "BUILD_ID = primeros 16 hex del aggregateSha256; app/ excluye build-lock y manifest V174."
};
var CX_BUILD_ID=CX_SOURCE_LOCK.aggregateSha256.slice(0,16);
if(typeof window!=='undefined'){window.CX=window.CX||{};window.CX.BUILD_ID=CX_BUILD_ID;window.CX.SOURCE_LOCK=CX_SOURCE_LOCK;}
