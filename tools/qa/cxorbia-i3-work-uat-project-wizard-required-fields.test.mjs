import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// I3 Project wizard UAT: synthetic DOM only, no real backend or credentials.
const source=fs.readFileSync(new URL('../../app/modules/proyecto-wizard.js',import.meta.url),'utf8');
class Element {
 constructor(value=''){this.value=value;this.checked=false;this.disabled=false;this.dataset={};this.handlers={};this.attrs={};this.style={};}
 addEventListener(type,callback){this.handlers[type]=callback;}
 setAttribute(name,value){this.attrs[name]=String(value);}
 emit(type){this.handlers[type]?.();}
}
class Wrap {
 constructor(countries){this.countries=countries;this.elements={};this.boxes=[];this.html='';}
 set innerHTML(value){
  this.html=value;
  this.elements={};
  this.elements['#wBack']=new Element();
  this.elements['#wNext']=new Element();
  const m=value.match(/id="f_name"[^>]*\bvalue="([^"]*)"/);
  if(m)this.elements['#f_name']=new Element(m[1]);
  if(value.includes('id="f_paisSearch"')){
   this.elements['#f_paisSearch']=new Element();
   this.boxes=this.countries.map(country=>{
     const c=new Element();
     c.dataset.c=country.c;c.dataset.cur=country.cur;
     c.checked=value.includes('data-c="'+country.c+'" data-cur="'+country.cur+'" checked');
     return c;
   });
  }
 }
 get innerHTML(){return this.html;}
 querySelector(sel){return this.elements[sel]||null;}
 querySelectorAll(sel){
  if(sel==='.wCountry')return this.boxes;
  if(sel==='.wCountry:checked')return this.boxes.filter(x=>x.checked);
  if(sel==='.wPaisRow')return [];
  return [];
 }
}
function open(){
 const countries=[{c:'GT',n:'Guatemala',cur:'GTQ'},{c:'HN',n:'Honduras',cur:'HNL'}];
 const wrap=new Wrap(countries),calls={provider:0,toasts:[]};
 const CX={COUNTRIES:countries};
 const ui={
  el:()=>wrap,aiBox:()=>'',toast:(...args)=>calls.toasts.push(args),
  modal:(title,html,options)=>{
   options?.onMount?.({querySelector:s=>s==='#wizMount'?{innerHTML:'',appendChild:()=>{}}:null},()=>{});
   return ()=>{};
  }
 };
 const data={addProject:()=>{calls.provider++;throw Error('NO_REAL_PROJECT_WRITES_IN_QA');}};
 vm.runInNewContext(source,{window:{CX},CX,console},{filename:'proyecto-wizard.js'});
 CX.projectWizard(data,ui);
 return {wrap,calls};
}
test('wizard step 1 cannot advance with blank name and zero countries',()=>{
 const {wrap,calls}=open();
 const next=wrap.querySelector('#wNext');
 assert.equal(next.disabled,true,'Next must be disabled before required data');
 next.emit('click'); // synthetic forced click must still be fail-closed.
 assert.match(wrap.innerHTML,/paso 1 de 5/);
 assert.equal(calls.provider,0);
});
test('wizard requires both name and country, not just one',()=>{
 const {wrap}=open();
 const name=wrap.querySelector('#f_name'),country=wrap.querySelectorAll('.wCountry')[0];
 name.value='   ';name.emit('input');
 assert.equal(wrap.querySelector('#wNext').disabled,true);
 name.value='QA Tenant Program';name.emit('input');
 assert.equal(wrap.querySelector('#wNext').disabled,true,'Name alone cannot advance');
 country.checked=true;country.emit('change');
 assert.equal(wrap.querySelector('#wNext').disabled,false,'Country plus nonblank name enables advance');
 country.checked=false;country.emit('change');
 assert.equal(wrap.querySelector('#wNext').disabled,true,'Removing country blocks advance immediately');
});
test('wizard valid entry advances one step without writing provider data',()=>{
 const {wrap,calls}=open();
 const name=wrap.querySelector('#f_name');name.value='Independent program';name.emit('input');
 const co=wrap.querySelectorAll('.wCountry')[0];co.checked=true;co.emit('change');
 const next=wrap.querySelector('#wNext');
 assert.equal(next.disabled,false);
 next.emit('click');
 assert.match(wrap.innerHTML,/paso 2 de 5/);
 assert.equal(calls.provider,0);
});
