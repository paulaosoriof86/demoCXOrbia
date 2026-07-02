/* CXOrbia · CX.data finance read bridge. Archivo backend nuevo; cargar solo en preview DEV. */
window.CX = window.CX || {};
(function(){
  function empty(){
    return {items:[], totals:{count:0,total:0,honorarium:0,reimbursements:0,byCurrency:{}}, status:'ok'};
  }

  async function call(method, input){
    const b = CX.backendFinanceBenefits;
    if(!b || typeof b[method] !== 'function'){
      return Object.assign(empty(), {warning:'finance-bridge-not-ready'});
    }
    return b[method](input || {});
  }

  function pickShopperIdFromObject(obj){
    if(!obj || typeof obj !== 'object') return '';
    return obj.shopperId || obj.shopperID || obj.shopper_id || obj.evaluatorId || obj.evaluadorId || '';
  }

  async function shopperIdFromFirebaseClaims(){
    try{
      if(!window.firebase || !firebase.auth) return '';
      const auth = firebase.auth();
      const user = auth && auth.currentUser;
      if(!user || typeof user.getIdTokenResult !== 'function') return '';
      const token = await user.getIdTokenResult(true);
      const claims = token && token.claims;
      return pickShopperIdFromObject(claims);
    }catch(_){
      return '';
    }
  }

  async function resolveShopperId(input, data){
    input = input || {};
    const direct = input.shopperId || input.userId || input.uid || '';
    if(direct) return direct;

    const candidates = [
      data && data.currentUser,
      data && data.user,
      CX.currentUser,
      CX.user,
      CX.authUser,
      CX.session && CX.session.user,
    ];

    for(const item of candidates){
      const picked = pickShopperIdFromObject(item);
      if(picked) return picked;
      if(item && item.id && item.role === 'shopper') return item.id;
    }

    return await shopperIdFromFirebaseClaims();
  }

  function install(){
    const D = CX.data;
    if(!D || D.__financeReadBridge) return false;

    D.getMyBenefits = async function(input){
      input = Object.assign({}, input || {});
      const shopperId = await resolveShopperId(input, this);
      if(!shopperId){
        return Promise.resolve(Object.assign(empty(), {warning:'missing-shopperId'}));
      }
      input.shopperId = shopperId;
      return call('getMyBenefits', input);
    };

    if(typeof D.getShopperBenefitsAdmin !== 'function'){
      D.getShopperBenefitsAdmin = function(input){ return call('getShopperBenefitsAdmin', input); };
    }
    if(typeof D.getFinancialMovements !== 'function'){
      D.getFinancialMovements = function(input){ return call('getFinancialMovements', input); };
    }
    if(typeof D.getPaymentLots !== 'function'){
      D.getPaymentLots = function(input){ return call('getPaymentLots', input); };
    }
    if(typeof D.suggestReconciliations !== 'function'){
      D.suggestReconciliations = function(input){ return call('suggestReconciliations', input); };
    }

    D.__financeReadBridge = true;
    if(CX.bus) CX.bus.emit('finance-read-bridge-ready', {installed:true, preview:!!(CX.BACKEND && CX.BACKEND.previewMode)});
    return true;
  }

  CX.installFinanceReadBridge = install;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
