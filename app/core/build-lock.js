/* CXOrbia source lock runtime Cloud V6 Core Operations + Shopper */
var CX_SOURCE_LOCK = {
  manifestFile: 'docs/MANIFEST-CLOUD-V6-CORE-OPS-SHOPPER-20260804.json',
  aggregateSha256: '1f1af3a316c9dabf1df1ef5b07a7abd2fe62a8da09e704719912be7af328e825',
  fileCount: 2351,
  generatedAt: '2026-08-04T20:44:07.0101444Z',
  candidateId: 'PAQUETE-CLOUD-FRONTEND-ACUMULADO-V6',
  candidateSha256: '0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407',
  packageSha256: '0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407',
  repository: 'paulaosoriof86/demoCXOrbia',
  branch: 'docs-tya-v6-v71-audit',
  pullRequest: 7,
  headBefore: 'a2ccfb0c3709cad6f5e6a9c16dcb7f9293532d6e',
  status: 'V6_EMPALMED_PENDING_DEV_LAB_AND_VISUAL',
  releaseSlice: 'ADMIN_OPERACIONES_PLUS_SHOPPER',
  devOnlyLab: true,
  production: false,
  note: 'BUILD_ID = primeros 16 hex del aggregateSha256; app/ excluye build-lock y manifest Cloud V6.'
};
var CX_BUILD_ID = CX_SOURCE_LOCK.aggregateSha256.slice(0, 16);
if (typeof window !== 'undefined') {
  window.CX = window.CX || {};
  window.CX.BUILD_ID = CX_BUILD_ID;
  window.CX.SOURCE_LOCK = CX_SOURCE_LOCK;
}
