# RUN 199 IDENTITY UNIVERSE DIAGNOSTIC V5 — FROZEN

Date: 2026-09-18
Iteration: I3 — FUNCTIONAL CLOSURE
Status: FROZEN_CONTROL_EVIDENCE

Run: 35373176355
Artifact: 10559880718
Artifact digest: sha256:22d5e8944c220f806d0df67116f7261d8d08c56e904e2d79639b253d1a36c7b5
Diagnostic schema: cxorbia.recovery.identity-universe-diagnostic.v5
Raw identity-universe-diagnostic.json SHA-256: b5d5b023d1ce696b0c13ce6439d40b842dee38e9257aa602721b5072fcc1f709
HR source revision: 807030afae2439942198013a69c390cd856619cfc7bb383b7b1e95c88c65cd7e
readOnly=true; piiExported=false; providerWrites=0; production=false.

## Frozen decisive counts
- membershipsTotal=431; activeShopperMemberships=426; authPresent=426
- profiles=558; profileCanonicalIds=558; duplicateCanonicalProfileIds=0
- liveHrShoppers=218; liveHrVisits=704
- durableVisits=1322; durableVisitUniqueKeys=704
- durableVisitDuplicateGroups=618; durableDuplicateRows=618; durableOwnerConflictGroups=611
- duplicateGroupsWithExactlyOneDocIdMatchingLive=618; withNoDocIdMatchingLive=0; withTwoDocIdMatchingLive=0
- duplicateDocsCurrentRevision=618; duplicateGroupsWithExactlyOneCurrentRevision=618; withTwoCurrentRevision=0
- durablePostulations=16; platformPostulations=16; syntheticHrPostIdsInDurableStore=0
- identityLinks=26; activeIdentityLinks=26
- identityCrosswalk=426; activeHrCrosswalk=221
- liveCrossUnique=218; liveCrossAmbiguous=0; liveCrossNone=0; liveCrossUniqueActive=218
- liveLinkUnique=24; liveLinkAmbiguous=0; liveLinkNone=194; liveLinkUniqueActive=16; uniqueLinkCrossConflict=24
- memberProfileResolved=401; memberProfileAmbiguous=25; memberProfileMissing=0
- memberToLiveResolved=22; memberToLiveAmbiguous=235
- credentialDerivable=238; credentialMetadataCurrent=204
- clientMemberships=0; clientScopedToProject=0; clientAuthPresent=0

## Frozen interpretation
1. Durable visit duplicates are preserved. The document whose Firestore docId matches the live HR stable visit key/current revision is authoritative; older duplicates remain historical/non-authoritative.
2. Active exact HR crosswalk has deterministic precedence over conflicting historical identityLinks; no fuzzy matching.
3. Synthetic HR postulations are a runtime projection defect, not durable data. UI authority is durable postulations only.
4. Client failure is missing durable membership in DEV; reuse the existing historical canonical client identity, never invent a new user.
5. This diagnostic is control evidence only and does not change product source.
