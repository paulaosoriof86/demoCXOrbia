import crypto from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';

const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().filter(k => value[k] !== undefined && typeof value[k] !== 'function').map(k => [k, stable(value[k])])) : value;
export const commandDigest = command => crypto.createHash('sha256').update(JSON.stringify(stable(command))).digest('hex');
export const sameDocument = isDeepStrictEqual;
export function requireProviderAck(ack, label) {
  if (!ack || !['ok','committed','providerAck','successUiAllowed'].every(k => ack[k] === true))
    throw new Error('PROVIDER_FAILURE:' + label + ':ACK_NOT_COMMITTED');
  return ack;
}
export function reservationLifecyclePassed(r) {
  return r?.operationKind === 'SYNTHETIC_PROVIDER_LIFECYCLE' && r.production === false &&
    ['created','createAck','statusAck','deleted','deleteAck','independentFirestoreReadback','reloadReadback',
      'absentAfterReload','idempotentReplay','cleanupVerified'].every(k => r[k] === true) && r.duplicateCount === 0;
}
export function requireExactCommandReceipt(receipt, command, actorUid) {
  if (!(receipt?.status === 'committed' && receipt.providerAck === true &&
    receipt.commandDigest === commandDigest(command) && receipt.commandType === command.commandType &&
    String(receipt.entityId) === String(command.entityId) && receipt.actorUid === actorUid))
    throw new Error('PERSISTENCE_FAILURE:FIXTURE_RECEIPT_MISMATCH');
}
const sameTime = (a, b) => !!a && !!b && typeof a.isEqual === 'function' && a.isEqual(b);

// This journal is registered before the POST. Never overwrite another operator's write.
export async function restoreAssignment(db, journal) {
  if (journal.restored === true) return journal.result;
  const {ref, receiptRef, beforeData, beforeUpdateTime, command, actorUid} = journal;
  const result = await db.runTransaction(async tx => {
    const [visit, receipt] = await Promise.all([tx.get(ref), tx.get(receiptRef)]);
    if (!visit.exists) throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_VISIT_MISSING');
    const current = visit.data();
    if (sameDocument(current, beforeData)) {
      // A timed-out request can still commit: absence alone is not proof of no write.
      if (journal.submitted && !receipt.exists && journal.outcome !== 'BLOCKED_NO_WRITES')
        throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_AMBIGUOUS_REQUEST');
      if (receipt.exists) requireExactCommandReceipt(receipt.data(), command, actorUid);
      else if (!sameTime(visit.updateTime, beforeUpdateTime))
        throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_CONCURRENT_WRITE');
      return {ok:true, restored:true, writes:0, alreadyRestored:true};
    }
    if (!receipt.exists) throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_RECEIPT_MISSING');
    requireExactCommandReceipt(receipt.data(), command, actorUid);
    if (!sameTime(visit.updateTime, receipt.updateTime))
      throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_CONCURRENT_WRITE');
    const expected = {...beforeData, shopperId:command.payload.shopperId, estado:'asignada', status:'asignada',
      assignmentSource:'platform', assignmentSyncStatus:'pending_hr', hrRowId:command.payload.hrRowId || beforeData.hrRowId || null,
      periodId:command.periodId, lastSyncedAt:null, updatedAt:current.updatedAt, version:Number(beforeData.version || 0)+1};
    if (!current.updatedAt || !Number.isFinite(Date.parse(current.updatedAt)) || !sameDocument(current, expected))
      throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_POSTIMAGE_CONFLICT');
    tx.set(ref, beforeData, {merge:false});
    return {ok:true, restored:true, writes:1, alreadyRestored:false};
  });
  const readback = await ref.get();
  if (!readback.exists || !sameDocument(readback.data(), beforeData))
    throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_READBACK_CONFLICT');
  journal.restored = true;
  journal.result = {...result, exactReadback:true};
  return journal.result;
}
