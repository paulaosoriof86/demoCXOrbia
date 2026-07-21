/* CXOrbia source lock runtime V172 empalme directo 20260721 */
var CX_SOURCE_LOCK={
  "manifestFile": "docs/MANIFEST-V172-EMPALME-DIRECTO-20260721.json",
  "aggregateSha256": "dd4cec1d7af4b4382d9671aa90a9c5a6e4808dae98d0d9feffb5a521982dfcb3",
  "fileCount": 1861,
  "generatedAt": "2026-07-21",
  "candidateSha256": "2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5",
  "headBefore": "aedb31aa15ec5e4eecf4a9a82c4161b50adca7b5",
  "status": "EMPALMED_PENDING_POST_GATES",
  "note": "BUILD_ID = primeros 16 hex del aggregateSha256; calculado sobre app/ excluyendo build-lock y el propio manifest V172."
};
var CX_BUILD_ID=CX_SOURCE_LOCK.aggregateSha256.slice(0,16);
if(typeof window!=='undefined'){window.CX=window.CX||{};window.CX.BUILD_ID=CX_BUILD_ID;window.CX.SOURCE_LOCK=CX_SOURCE_LOCK;}
