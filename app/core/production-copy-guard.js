/* CXOrbia · Production safety copy guard post V91
   Purpose: prevent visible UI from promising real integrations while backend gates remain closed.
   No network calls, no writes, no external providers. */
(function(){
  'use strict';
  const pairs=[
    ['Aprobada · WhatsApp enviado al shopper','Aprobación registrada · WhatsApp/fallback manual preparado'],
    ['Aprobada · WhatsApp enviado','Aprobación registrada · notificación preparada'],
    ['WhatsApp enviado (Make)','WhatsApp/fallback manual preparado · Make pendiente backend'],
    ['WhatsApp enviado','WhatsApp/fallback manual preparado'],
    ['WA enviado al shopper','WA fallback/manual preparado · pendiente confirmación'],
    ['Notificación enviada por WhatsApp al shopper','Notificación preparada para WhatsApp · envío real pendiente'],
    ['Notificación enviada por WhatsApp','Notificación preparada para WhatsApp · envío real pendiente'],
    ['Correo enviado a','Correo preparado para'],
    ['Correo guardado en Enviados · se despachará al conectar tu cuenta','Correo preparado en carpeta Enviados · despacho real pendiente de backend/gate'],
    ['HR sincronizada','HR sync pendiente backend'],
    ['HR actualizada','HR preparada · sync pendiente backend'],
    ['shopper notificado','notificación preparada'],
    ['Payload de prueba enviado al escenario Make','Payload de prueba preparado para escenario Make · envío real pendiente de gate'],
    ['Payload de prueba enviado','Payload de prueba preparado'],
    ['Disparo enviado a Make','Evento preparado · Make real pendiente de gate'],
    ['Disparo enviado','Evento preparado'],
    ['eventos enviados','eventos preparados'],
    ['últimos eventos enviados','últimos eventos preparados'],
    ['Cuestionario enviado tarde','Cuestionario completado tarde'],
    ['Cuestionario enviado ·','Cuestionario completado ·'],
    ['cuestionario enviado','cuestionario realizado/completado'],
    ['El cuestionario fue enviado desde la plataforma.','El cuestionario fue completado y queda pendiente de revisión/submitido según backend.'],
    ['marca la visita como cuestionario enviado','marca la visita como cuestionario realizado/completado'],
    ['sincronizando correos reales','sincronización real pendiente de backend/gate'],
    ['Conectado como','Cuenta preparada como'],
    ['Conectado','Preparado'],
    ['conectado','preparado'],
    ['egreso(s) automáticos','egresos pendientes confirmación backend'],
    ['se generan los egresos automáticamente','los egresos quedan preparados y requieren confirmación/backend'],
    ['Make activo','Make pendiente backend'],
    ['Google Sheets en vivo','Google Sheets preview · backend pendiente'],
    ['portal en vivo','portal preview · backend pendiente'],
    ['● En vivo','Preview · backend pendiente'],
    ['HR viva + export','HR source preview + export pendiente backend']
  ];

  function safeCopy(value){
    if(typeof value!=='string') return value;
    let out=value;
    for(const [from,to] of pairs) out=out.split(from).join(to);
    return out;
  }

  window.CX=window.CX||{};
  window.CX.safeCopy=safeCopy;

  function patchFn(obj,name,argIndexes){
    if(!obj||typeof obj[name]!=='function'||obj[name].__safeCopyPatched) return;
    const original=obj[name];
    const wrapped=function(...args){
      for(const idx of argIndexes){
        if(typeof args[idx]==='string') args[idx]=safeCopy(args[idx]);
      }
      return original.apply(this,args);
    };
    wrapped.__safeCopyPatched=true;
    obj[name]=wrapped;
  }

  function patchUi(){
    const ui=window.CX&&window.CX.ui;
    if(!ui) return;
    patchFn(ui,'toast',[0]);
    patchFn(ui,'aiBox',[0,1]);
    patchFn(ui,'ph',[0,1]);
    patchFn(ui,'modal',[0,1]);
    patchFn(ui,'empty',[0,1]);
    patchFn(ui,'bdg',[0]);
  }

  function patchDom(){
    try{
      const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
      if(desc&&desc.set&&!Element.prototype.__safeCopyInnerHTML){
        Object.defineProperty(Element.prototype,'innerHTML',{
          get:desc.get,
          set:function(value){ return desc.set.call(this,safeCopy(value)); },
          configurable:true,
          enumerable:desc.enumerable
        });
        Element.prototype.__safeCopyInnerHTML=true;
      }
    }catch(e){}
    try{
      const original=Element.prototype.insertAdjacentHTML;
      if(original&&!original.__safeCopyPatched){
        Element.prototype.insertAdjacentHTML=function(position,text){
          return original.call(this,position,safeCopy(text));
        };
        Element.prototype.insertAdjacentHTML.__safeCopyPatched=true;
      }
    }catch(e){}
  }

  patchDom();
  patchUi();
  document.addEventListener('DOMContentLoaded',patchUi);
  setTimeout(patchUi,0);
})();
