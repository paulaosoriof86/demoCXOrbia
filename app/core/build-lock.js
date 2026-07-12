/* CXOrbia · Source lock unión V110 · R10 final
   No implica deploy, producción, importación ni providers activos. */
var CX_SOURCE_LOCK={
  manifestFile:'docs/MANIFEST-V110-UNION-EMPALME-R1.json',
  aggregateSha256:'49f04c99e18db14b574d40c6a7f0a995682f2ddfc9487face33d74835cf320b1',
  fileCount:1380,
  runtimeIdentity:'67 exactos V110 + 2 overrides locales protegidos + lock unión',
  r10Decision:'PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE',
  generatedAt:'2026-07-12',
  sourceZipSha256:'1f9e30f711899af500683e7292eb8652e9e0bc4b888cd1252a5482795dbba227',
  note:'V110 empalmada; R10 final documentado; backend y source-safe preservados.'
};
var CX_BUILD_ID=CX_SOURCE_LOCK.aggregateSha256.slice(0,16);
if(typeof window!=='undefined'){window.CX=window.CX||{};window.CX.BUILD_ID=CX_BUILD_ID;window.CX.SOURCE_LOCK=CX_SOURCE_LOCK;}
