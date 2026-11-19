// Pure, bounded A08 evidence classifier. A disabled historical principal is
// never an active login collision; it is not deleted or reactivated here.
export function classifyA08MembershipEvidence({profileExists,membershipCount,authRecords,membershipQueryBoundedAt=9}) {
  const records=Array.isArray(authRecords)?authRecords:[];
  const count=Number(membershipCount);
  const bound=Number(membershipQueryBoundedAt);
  const eligible=records.filter(x=>x.authLookup==='PRESENT'&&x.activeMembership===true&&
    x.role==='shopper'&&x.authNamespace==='shopper'&&x.projectMember===true&&
    x.authDisabled===false&&x.claimShopperMatches===true&&
    x.claimRoleMatches===true&&x.claimTenantMatches===true);
  const historicalDisabled=records.filter(x=>x.authLookup==='PRESENT'&&
    x.activeMembership===false&&x.authDisabled===true);
  const classification=!Number.isInteger(count)||count<0||records.length!==count||
    !Number.isInteger(bound)||bound<2?
    'MAPPING_FAILURE:EXCEPTION_AUTH_EVIDENCE_INCOMPLETE':
    count>=bound?'AUTH_FAILURE:EXCEPTION_MEMBERSHIP_BOUND_EXCEEDED':
    eligible.length>1?'AUTH_FAILURE:EXCEPTION_ACTIVE_MEMBERSHIP_COLLISION':
    profileExists===true&&eligible.length===1&&eligible.length+historicalDisabled.length===count?
      (historicalDisabled.length?'AUTH_RECORD_CONSISTENT_DISABLED_HISTORY_PASSWORD_LOGIN_UNPROVEN':
        'AUTH_RECORD_CONSISTENT_PASSWORD_LOGIN_UNPROVEN'):
    profileExists!==true&&count===0?'AUTH_FAILURE:EXCEPTION_ORPHAN_NONCANONICAL':
    eligible.length===1&&count>1?'AUTH_FAILURE:EXCEPTION_AMBIGUOUS_MEMBERSHIP':
    'AUTH_FAILURE:EXCEPTION_AUTH_MAPPING_INCOMPLETE';
  return {classification,canonicalAuthEligibleCount:eligible.length,
    historicalDisabledMembershipCount:historicalDisabled.length,
    ordinaryPasswordLoginProven:false};
}
