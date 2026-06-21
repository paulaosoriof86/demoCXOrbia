/* ============================================================
   CXOrbia · Motor financiero (por proyecto, multipaís)
   - Ingresos (lo que se recibe del cliente) y egresos (honorarios pagados)
   - Modelo directo (ISR + regalías) vs delegado (solo honorario recibido/pagado)
   - Presupuesto de gastos fijos vs real
   - Cuentas por pagar (liquidaciones no pagadas) y por cobrar (facturas pendientes)
   Separación SIEMPRE por moneda y país del proyecto (genérico, cualquier país).
   ============================================================ */
window.CX = window.CX || {};

/* almacén simple de movimientos/presupuesto manuales por proyecto (demo en memoria) */
CX.finStore = {
  _mov:{}, _pres:{},
  mov(pid){ return this._mov[pid] || (this._mov[pid]=[]); },
  addMov(pid,m){ this.mov(pid).push(Object.assign({id:'m'+Date.now().toString(36),fecha:new Date().toISOString().slice(0,10)},m)); CX.bus&&CX.bus.emit('fin'); },
  pres(pid){ return this._pres[pid] || (this._pres[pid]={}); },
  setPres(pid,k,v){ this.pres(pid)[k]=+v||0; CX.bus&&CX.bus.emit('fin'); },
};

CX.fin = {
  /* honorario que se RECIBE por país (config del proyecto; fallback = lo que se paga) */
  honRecibe(p,c){ return (p.honRecibe&&p.honRecibe[c]!=null)?p.honRecibe[c]:(p.honorario&&p.honorario[c])||0; },

  /* resumen por país a partir de las liquidaciones derivadas de visitas */
  porPais(data){
    const p=data.project(), liq=CX.liq.forProject(data), out={};
    p.countries.forEach(c=>{
      const ls=liq.filter(l=>l.pais===c);
      const cur=p.currency[c];
      const visRe=ls.length;                                   // visitas con liquidación
      const ingreso=ls.reduce((a)=>a+this.honRecibe(p,c),0);   // lo facturado al cliente
      const honPaga=ls.reduce((a,l)=>a+l.honorario,0);         // honorarios a shoppers
      const reemb=ls.reduce((a,l)=>a+l.reembolso,0);           // flujo (no utilidad)
      const isr=p.modelo==='directo'?Math.round(ingreso*((p.isr||0)/100)):0;
      const regal=p.modelo==='directo'?Math.round(ingreso*((p.regalias||0)/100)):0;
      const fijos=Object.values(CX.finStore.pres(p.id)).reduce((a,b)=>a+(+b||0),0);
      const margen=ingreso-honPaga-isr-regal; // reembolso es flujo, no resta utilidad
      const cxp=ls.filter(l=>l.estado!=='pagada').reduce((a,l)=>a+l.total,0); // por pagar a shoppers
      const cobrado=ls.filter(l=>l.estado==='pagada').length;
      const cxc=ls.filter(l=>l.estado==='validada'||l.estado==='pagada').reduce((a)=>a+this.honRecibe(p,c),0); // facturable
      out[c]={cur,visRe,ingreso,honPaga,reemb,isr,regal,fijos,margen,cxp,cxc,
        margenPct: ingreso?Math.round(margen/ingreso*100):0};
    });
    return out;
  },

  /* serie mensual demo (últimos meses) para comparativos */
  serieMensual(p,c){
    const base=this.honRecibe(p,c)||100;
    const meses=['MAR','ABR','MAY','JUN'];
    return meses.map((m,i)=>({m, ingreso:Math.round(base*(8+i*2)), margen:Math.round(base*(8+i*2)*0.38)}));
  },
};
