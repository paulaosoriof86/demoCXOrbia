# CXOrbia Firebase DEV clean-state read-only report

Generated: 2026-07-13T03:27:02.610Z
Decision: NONEMPTY_REVIEW_REQUIRED
Project ID match: true
Service-account domain match: true
Mandatory checks available: false
Unavailable mandatory checks: 2
Non-empty signals: 2
Clean state confirmed: false

## Sanitized checks
- authUsers: {"id":"authUsers","available":true,"totalCount":17,"empty":false}
- authConfiguration: {"id":"authConfiguration","available":true,"emailPasswordEnabled":true,"anonymousEnabled":false,"phoneEnabled":false}
- firestoreRootCollections: {"id":"firestoreRootCollections","available":true,"rootCollectionCount":1,"anyDocumentDetected":true,"empty":false}
- firestoreDatabases: {"id":"firestoreDatabases","available":false,"errorCategory":"400"}
- storageObjects: {"id":"storageObjects","available":false,"errorCategory":"NOT_FOUND_OR_API_NOT_INITIALIZED"}
- cloudFunctions: {"id":"cloudFunctions","available":false,"errorCategory":"PERMISSION_DENIED"}
- rulesReleases: {"id":"rulesReleases","available":true,"releaseCount":1}

## Safe state
- Provider reads executed only after manual confirmation
- No users created or changed
- No claims written
- No Firestore document fields read
- No Firestore or Storage writes/deletes
- No function names output, writes or invocations
- No rules or Hosting deploy
- No imports or production access
- No PII or credentials in report
