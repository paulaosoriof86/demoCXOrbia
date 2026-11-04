import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../../app/modules/visitas.js',import.meta.url),'utf8');
const binderBlock=source.match(/const replaceClickHandler=\(element,action,handler\)=>\{[\s\S]*?\n  \};/);
assert.ok(binderBlock,'Visitas must replace, not accumulate, handlers for a button/action pair');
const bind=runInNewContext(`(()=>{ ${binderBlock[0]} return replaceClickHandler; })()`);

function button(){
  const listeners=new Map();
  return {
    [Symbol.for('cxorbia.visitas.click.admin-detail')]:undefined,
    addEventListener(type,fn){const list=listeners.get(type)||[];list.push(fn);listeners.set(type,list);},
    removeEventListener(type,fn){listeners.set(type,(listeners.get(type)||[]).filter(item=>item!==fn));},
    click(){for(const fn of [...(listeners.get('click')||[])])fn();},
    listenerCount(type){return (listeners.get(type)||[]).length;}
  };
}

test('async Admin rerenders replace the same visit detail handler and open once',()=>{
  const node=button();let oldCalls=0,newCalls=0;
  bind(node,'admin-detail',()=>oldCalls++);
  bind(node,'admin-detail',()=>newCalls++);
  bind(node,'admin-detail',()=>newCalls++);
  node.click();
  assert.equal(oldCalls,0);
  assert.equal(newCalls,1);
  assert.equal(node.listenerCount('click'),1);
});

test('Shopper rebinding uses the same idempotent owner for regenerated detail buttons',()=>{
  assert.match(source,/replaceClickHandler\(b,'shopper-detail',\(\)=>\{/);
  assert.match(source,/replaceClickHandler\(b,'admin-detail',\(\)=>detailModal\(/);
  assert.doesNotMatch(source,/querySelectorAll\('\[data-detail\]'\)\.forEach\(b=>b\.addEventListener\('click'/);
  assert.doesNotMatch(source,/querySelectorAll\('\[data-vdetail\]'\)\.forEach\(b=>b\.addEventListener\('click'/);
});
