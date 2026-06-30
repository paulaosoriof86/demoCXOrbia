/* CXOrbia · CX.data finance read bridge. Archivo nuevo; cargar solo en preview DEV. */
window.CX = window.CX || {};
(function(){
  function empty(){ return {items:[], totals:{count:0,total:0,honorarium:0,reimbursements:0,byCurrency:{}}, status:'ok'}; }
  async function call(method, input){
    const b = CX.backendFinanceBenefits;
    if(!b || typeof b[method] !== 'function') return Object.assign(empty(), {warning:'finance-bridge-not-ready'});
    return b[method](input || {});
  }
  function install(){
    const D = CX.data;
    if(!D || D.__financeReadBridge) return false;
    if(typeof D.getMyBenefits !== 'function') D.getMyBenefits = function(input){
      input = input || {};
      if(!input.shopperId && this.currentUser && this.currentUser.id) input.shopperId = this.currentUser.id;
      if(!input.shopperId) return Promise.resolve(Object.assign(empty(), {warning:'missing-shopperId'}));
      return call('getMyBenefits', input);
    };
    if(typeof D.getShopperBenefitsAdmin !== 'function') D.getShopperBenefitsAdmin = function(input){ return call('getShopperBenefitsAdmin', input); };
    if(typeof D.getFinancialMovements !== 'function') D.getFinancialMovements = function(input){ return call('getFinancialMovements', input); };
    if(typeof D.getPaymentLots !== 'function') D.getPaymentLots = function(input){ return call('getPaymentLots', input); };
    if(typeof D.suggestReconciliations !== 'function') D.suggestReconciliations = function(input){ return call('suggestReconciliations', input); };
    D.__financeReadBridge = true;
    if(CX.bus) CX.bus.emit('finance-read-bridge-ready', {installed:true});
    return true;
  }
  CX.installFinanceReadBridge = install;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();
