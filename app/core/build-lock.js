/* CXOrbia source lock runtime V172 HR in-place 20260721 */
var CX_SOURCE_LOCK={
  "manifestFile": "docs/MANIFEST-V172-EMPALME-DIRECTO-20260721.json",
  "aggregateSha256": "dbfd2786e7dd3557351de591bda3464669a6ac36681f93b677c5bf696f22087e",
  "fileCount": 1863,
  "generatedAt": "2026-07-21",
  "candidateSha256": "2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5",
  "packageSha256": "eaadd16ef78539bfd45c60ad8eed9dc0507a385b80583640fb3f1666f4f9eb15",
  "headBefore": "a41e7ef7b6315ef71151f1695aa1875bb482fba9",
  "status": "V172_HR_INPLACE_APPLIED_PENDING_REMOTE_GATES",
  "note": "BUILD_ID = primeros 16 hex del aggregateSha256; calculado sobre app/ excluyendo build-lock y el propio manifest V172."
};
var CX_BUILD_ID=CX_SOURCE_LOCK.aggregateSha256.slice(0,16);
if(typeof window!=='undefined'){window.CX=window.CX||{};window.CX.BUILD_ID=CX_BUILD_ID;window.CX.SOURCE_LOCK=CX_SOURCE_LOCK;}
