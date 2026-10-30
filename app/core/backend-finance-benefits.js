/* ============================================================
   CXOrbia · Backend Finance Benefits adapter (scaffold seguro)
   ------------------------------------------------------------
   Complementa app/core/backend-firebase.js sin tocar módulos UI.
   No se activa solo. Expone métodos para Finanzas/Mis Beneficios.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const ns = CX.backendFinanceBenefits = CX.backendFinanceBenefits || {};

  function cfg(){ return CX.BACKEND || {}; }
  function emit(name, payload){ if(CX.bus) CX.bus.emit(name, payload || {}); }
  function warn(){ console.warn.apply(console, ['[CX.backend.finance]'].concat([].slice.call(arguments))); }

  function isReady(){
    return !!(window.firebase && firebase.apps && firebase.apps.length && firebase.firestore);
  }

  function db(){
    if(!isReady()) throw new Error('Firebase no inicializado para finanzas');
    return firebase.firestore();
  }

  function tenantId(input){
    return (input && input.tenantId) || (CX.backend && CX.backend.tenantId && CX.backend.tenantId()) || cfg().tenantId || 'tya';
  }

  function tenantRef(input){ return db().collection('tenants').doc(tenantId(input)); }
  function col(input, name){ return tenantRef(input).collection(name); }
  function docData(d){ return Object.assign({id:d.id}, d.data() || {}); }

  function emptyTotals(){
    return {count:0,total:0,honorarium:0,reimbursements:0,byCurrency:{}};
  }

  function summarize(items){
    const totals = emptyTotals();
    (items || []).forEach(b=>{
      const currency = b.currency || 'OTHER';
      const honorarium = Number(b.honorariumAmount || 0);
      const reimb = Number(b.ticketReimbursementAmount || 0) + Number(b.comboReimbursementAmount || 0) + Number(b.otherReimbursementAmount || 0);
      const total = Number(b.totalCalculated || (honorarium + reimb));
      totals.count += 1;
      totals.total += total;
      totals.honorarium += honorarium;
      totals.reimbursements += reimb;
      totals.byCurrency[currency] = totals.byCurrency[currency] || {count:0,total:0,honorarium:0,reimbursements:0};
      totals.byCurrency[currency].count += 1;
      totals.byCurrency[currency].total += total;
      totals.byCurrency[currency].honorarium += honorarium;
      totals.byCurrency[currency].reimbursements += reimb;
    });
    return totals;
  }

  async function getMyBenefits(input){
    input = input || {};
    const shopperId = input.shopperId || input.userId || null;
    if(!shopperId){
      return {items:[], totals:emptyTotals(), status:'ok', warning:'missing-shopperId'};
    }

    let q = col(input, 'shopperBenefits').where('shopperId', '==', shopperId);
    if(input.projectId) q = q.where('projectId', '==', input.projectId);
    if(input.periodId) q = q.where('periodId', '==', input.periodId);
    const snap = await q.get();
    const items = snap.docs.map(docData);
    return {items, totals:summarize(items), status:'ok'};
  }

  async function getShopperBenefitsAdmin(input){
    input = input || {};
    let q = col(input, 'shopperBenefits');
    if(input.projectId) q = q.where('projectId', '==', input.projectId);
    if(input.country) q = q.where('country', '==', input.country);
    if(input.status) q = q.where('status', '==', input.status);
    const snap = await q.get();
    const items = snap.docs.map(docData);
    return {items, totals:summarize(items), status:'ok'};
  }

  function globalLedgerQuery(q,input){
    if(input.global!==true)return q;
    if(input.projectId!==null||!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(String(input.periodId||'')))throw new Error('FINANCE_GLOBAL_READ_SCOPE_REQUIRED');
    return q.where('global','==',true).where('projectId','==',null);
  }
  async function readLedger(q,input){
    const global=input.global===true;
    const expectedTenant=tenantId(input),expectedPeriod=input.periodId;
    const snap=await (global?q.get({source:'server'}):q.get());
    if(global&&(snap.metadata?.fromCache!==false||snap.metadata?.hasPendingWrites!==false))throw new Error('FINANCE_GLOBAL_REMOTE_READ_REQUIRED');
    const items=snap.docs.map(docData);
    if(global&&items.some((row,i)=>snap.docs[i].data()?.id!==snap.docs[i].id||row.id!==snap.docs[i].id||row.global!==true||row.projectId!==null||row.tenantId!==expectedTenant||row.periodId!==expectedPeriod))throw new Error('FINANCE_GLOBAL_READ_SCOPE_MISMATCH');
    return {items,status:'ok'};
  }

  async function getFinancialMovements(input){
    input = input || {};
    let q = globalLedgerQuery(col(input, 'financialMovements'),input);
    if(input.projectId) q = q.where('projectId', '==', input.projectId);
    if(input.periodId) q = q.where('periodId', '==', input.periodId);
    if(input.country) q = q.where('country', '==', input.country);
    if(input.status) q = q.where('status', '==', input.status);
    return readLedger(q,input);
  }

  async function getFinanceAccounts(input){
    input = input || {};
    let q = globalLedgerQuery(col(input, 'financeAccounts'),input);
    if(input.projectId) q = q.where('projectId', '==', input.projectId);
    if(input.periodId) q = q.where('periodId', '==', input.periodId);
    if(input.kind) q = q.where('kind', '==', input.kind);
    if(input.country) q = q.where('country', '==', input.country);
    if(input.status) q = q.where('status', '==', input.status);
    return readLedger(q,input);
  }

  async function getFinanceBudgets(input){
    input=input||{};
    if(!input.projectId||!input.periodId)throw new Error('FINANCE_BUDGET_READ_SCOPE_REQUIRED');
    let q=col(input,'financeBudgets').where('projectId','==',input.projectId).where('periodId','==',input.periodId);
    const snap=await q.get();
    const items=snap.docs.map(docData).filter(x=>x.status==='active');
    return {items,status:'ok',projectId:input.projectId,periodId:input.periodId};
  }

  async function getPaymentLots(input){
    input = input || {};
    let q = col(input, 'paymentLots');
    if(input.projectId) q = q.where('projectId', '==', input.projectId);
    if(input.periodId) q = q.where('periodId', '==', input.periodId);
    if(input.country) q = q.where('country', '==', input.country);
    if(input.status) q = q.where('status', '==', input.status);
    const snap = await q.get();
    return {items:snap.docs.map(docData), status:'ok'};
  }

  async function suggestReconciliations(input){
    // Lectura solamente: la conciliación real requiere acción persistible y aprobación humana.
    input = input || {};
    const benefits = await getShopperBenefitsAdmin(Object.assign({}, input, {status: input.benefitStatus || 'calculated'}));
    const movements = await getFinancialMovements(input);
    return {
      items:[],
      sourceCounts:{benefits:benefits.items.length, financialMovements:movements.items.length},
      status:'review',
      warning:'suggestion-engine-not-implemented-yet'
    };
  }

  async function safeCall(label, fn, input){
    try{ return await fn(input || {}); }
    catch(e){
      warn(label, e);
      emit('backend-error', {label:'finance-'+label, message:e.message || String(e)});
      return {items:[], totals:emptyTotals(), status:'error', errors:[e.message || String(e)]};
    }
  }

  Object.assign(ns, {
    isReady,
    getMyBenefits(input){ return safeCall('getMyBenefits', getMyBenefits, input); },
    getShopperBenefitsAdmin(input){ return safeCall('getShopperBenefitsAdmin', getShopperBenefitsAdmin, input); },
    getFinancialMovements(input){ return safeCall('getFinancialMovements', getFinancialMovements, input); },
    getFinanceAccounts(input){ return safeCall('getFinanceAccounts', getFinanceAccounts, input); },
    getFinanceBudgets(input){ return safeCall('getFinanceBudgets', getFinanceBudgets, input); },
    getPaymentLots(input){ return safeCall('getPaymentLots', getPaymentLots, input); },
    suggestReconciliations(input){ return safeCall('suggestReconciliations', suggestReconciliations, input); },
  });
})();
