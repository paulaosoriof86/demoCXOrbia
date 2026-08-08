/* CXOrbia source lock runtime Cloud V7.2-P0F1 responsive */
var CX_SOURCE_LOCK = {
  manifestFile: 'docs/MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json',
  aggregateSha256: 'ecc725866acc3eb8aab292000be3ec31d1c46b5c14a53c8889fa7d6716a997e2',
  fileCount: 2377,
  generatedAt: '2026-08-05T05:35:36.3102786Z',
  candidateId: 'CLOUD-V7-2-P0F1-RESPONSIVE',
  candidateSha256: '09606d1cc133a1e1e138be76bd8c6aadeb1f70d7967d506aae3f81bf5e9c6fce',
  packageSha256: '09606d1cc133a1e1e138be76bd8c6aadeb1f70d7967d506aae3f81bf5e9c6fce',
  repository: 'paulaosoriof86/demoCXOrbia',
  branch: 'docs-tya-v6-v71-audit',
  pullRequest: 7,
  headBefore: '4b52a23b0d7eb7bbff679bd921b0af5dd9a30181',
  status: 'V7_2_P0F1_EMPALMED_PENDING_POST_GATES',
  releaseSlice: 'ADMIN_OPERACIONES_PLUS_SHOPPER',
  devOnlyLab: true,
  production: false,
  note: 'BUILD_ID = primeros 16 hex del aggregateSha256; app/ excluye build-lock y manifest V7.2-P0F1.'
};
var CX_BUILD_ID = CX_SOURCE_LOCK.aggregateSha256.slice(0, 16);
if (typeof window !== 'undefined') {
  window.CX = window.CX || {};
  window.CX.BUILD_ID = CX_BUILD_ID;
  window.CX.SOURCE_LOCK = CX_SOURCE_LOCK;
}
