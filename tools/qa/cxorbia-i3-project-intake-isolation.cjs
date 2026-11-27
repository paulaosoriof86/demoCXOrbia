const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {DatabaseSync} = require('node:sqlite');
const vm = require('node:vm');

const source = process.argv[2];
assert.match(source || '', /^[a-f0-9]{40}$/);
const blob = file => execFileSync('git', ['show', source + ':' + file]);
const tenantId = 'qa-intake-synthetic';
const policy = {schemaVersion:'cxorbia.project-command-provider-policy.v1', enabled:true,
  allowedTenantIds:[tenantId], externalProviderWrites:false, hrWrites:false, makeCalls:false,
  geminiCalls:false, paymentWrites:false};

// The repository provider receives its normal document/transaction API. SQLite is a
// local test double. A separate read-only connection checks the committed bytes.
function documentFixture(file) {
  const db = new DatabaseSync(file);
  db.exec('CREATE TABLE records (path TEXT PRIMARY KEY, body TEXT NOT NULL)');
  const read = db.prepare('SELECT body FROM records WHERE path=?');
  const add = db.prepare('INSERT INTO records VALUES (?,?)');
  const put = db.prepare('INSERT OR REPLACE INTO records VALUES (?,?)');
  function collection(prefix) {
    return {doc(id) {
      const key = prefix + '/' + id;
      return {id, path:key, collection:name => collection(key + '/' + name), get() {
        const row = read.get(key);
        return {id, exists:!!row, data:() => row && JSON.parse(row.body)};
      }};
    }};
  }
  const providerDb = {collection, async runTransaction(fn) {
    db.exec('BEGIN');
    try {
      const result = await fn({get:ref => ref.get(),
        create:(ref, data) => add.run(ref.path, JSON.stringify(data)),
        set:(ref, data, options) => put.run(ref.path, JSON.stringify(options?.merge ?
          {...ref.get().data(), ...data} : data))});
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }};
  add.run('tenants/' + tenantId + '/users/admin', JSON.stringify({role:'admin', active:true, authNamespace:'staff'}));
  return {providerDb, close:() => db.close()};
}

// Parse the wizard's rendered controls at each step. lxml supplies field values,
// selected options and dataset entries. Only the DOM methods used by these owners
// are supplied. This instrument does not certify browser layout, HTTP or Firebase.
const parseFields = `
import json, sys
from lxml import html
root = html.fragment_fromstring(sys.stdin.read(), create_parent="main")
result = []
for el in root.xpath(".//input|.//select|.//textarea|.//button|.//div[@id]"):
    value = el.get("value", "")
    if el.tag == "textarea":
        value = el.text or ""
    if el.tag == "select":
        options = el.xpath("option[@selected]") or el.xpath("option[1]")
        if options:
            value = options[0].get("value", options[0].text or "")
    result.append([dict(el.attrib), value])
print(json.dumps(result))
`;
class WizardFields {
  set innerHTML(markup) {
    if (!markup) { this.fields=[]; return; }
    const parsed = JSON.parse(execFileSync('python', ['-c',parseFields], {input:markup,encoding:'utf8'}));
    this.fields = parsed.map(([attrs,value]) => ({
      attrs,value,checked:'checked' in attrs,style:{},events:{},
      dataset:Object.fromEntries(Object.entries(attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5),v])),
      addEventListener(event,fn){this.events[event]=fn;}, setAttribute(k,v){this.attrs[k]=v;}
    }));
  }
  querySelectorAll(selector) {
    const checked = selector.endsWith(':checked');
    const key = selector.replace(':checked','');
    return this.fields.filter(e=>{
      const matches=key.startsWith('.') ? (e.attrs.class||'').split(' ').includes(key.slice(1))
        : key.startsWith('#') ? e.attrs.id===key.slice(1) : key==='input[name="wmod"]' && e.attrs.name==='wmod';
      return matches && (!checked || e.checked);
    });
  }
  querySelector(s){return this.querySelectorAll(s)[0] || null;}
}
async function wizard(fixture, provider, created) {
  const fields = new WizardFields();
  let pending, route;
  const countryRoster=[{c:'CR',n:'Costa Rica',cur:'CRC'}, {c:'PA',n:'Panamá',cur:'PAB'}];
  const CX={BACKEND:{enabled:true,tenantId}, COUNTRIES:countryRoster, data:{ctx:()=>({tenantId}),projects:[]},
    session:{role:'admin'}, router:{buildRail(){},nav(name){route=name;}},
    commandAdapter:{async execute(command){
      pending=provider.execute('admin',structuredClone(command));
      const ack=await pending;
      assert.ok(ack.readbackVerified,JSON.stringify(ack));created.push({command:structuredClone(command),ack});
      return ack;
    }}};
  const sandbox={CX,document:{readyState:'loading',addEventListener(){}},console};
  sandbox.window=sandbox;
  const context=vm.createContext(sandbox);
  for(const file of ['app/adapters/cxorbia-cxdata-command-boundary-v1.js','app/modules/proyecto-wizard.js']){
    vm.runInContext(blob(file).toString(),context,{filename:file});
  }
  assert.ok(CX.cxDataCommandBoundary.install('isolated-intake'));
  CX.projectWizard(CX.data,{el:()=>fields,aiBox:()=>'',toast(){},
    modal(title,html,options){options.onMount({querySelector:()=>({appendChild(){}})},()=>{});return ()=>{};}});
  const field=id=>{const item=fields.querySelector('#'+id);assert.ok(item,id);return item;};
  const next=()=>field('wNext').events.click();
  field('f_name').value=fixture.name;
  field('f_ind').value='Ensayo sintético';
  for(const box of fields.querySelectorAll('.wCountry'))box.checked=fixture.countries.includes(box.dataset.c);
  next();
  for(const [index,country] of fixture.countries.entries()){
    fields.querySelectorAll('.wRec').find(e=>e.dataset.c===country).value=String(29+index);
    fields.querySelectorAll('.wPag').find(e=>e.dataset.c===country).value=String(13+index);
  }
  next();
  for(const option of fields.querySelectorAll('input[name="wmod"]'))option.checked=option.value===fixture.modelo;
  next();
  field('f_cmodo').value=fixture.questionnaire;
  field('f_scn').value='Control, Seguimiento';
  field('f_vent').value='Primera, Segunda';
  if(fixture.external){
    field('f_hr').value='Excel Online / OneDrive (por país)';
    for(const input of fields.querySelectorAll('.wHrCountryBinding'))input.value='qa-book-'+input.dataset.country;
    for(const input of fields.querySelectorAll('.wHrCountryMapping'))input.value='qa-map-'+input.dataset.country;
  }
  next();field('f_dias').value='21';next();
  assert.ok(pending);await pending;
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(route,'proyectos');
}

async function checkFinancialIsolation({created,periods,db,read,records}) {
  const bytes=blob('backend/runtime/cxorbia-finance-command-provider-v1.mjs');
  const {createFinanceCommandProvider}=await import('data:text/javascript;base64,'+bytes.toString('base64'));
  const projectIds=created.map(x=>x.ack.projectId);
  const member={uid:'finance-fixture',tenantId,role:'admin',authNamespace:'staff',active:true,projectIds};
  await db.runTransaction(tx=>tx.create(db.collection('tenants').doc(tenantId).collection('users').doc(member.uid),member));
  const provider=createFinanceCommandProvider({auth:{verifyIdToken:async()=>member},db,policy:{
    schemaVersion:'cxorbia.finance-command-provider-policy.v1',enabled:true,allowedTenantIds:[tenantId],
    allowedProjectIds:projectIds,externalPaymentWrites:false,bankWrites:false,hrWrites:false,conflictPolicy:'review_no_silent_overwrite'}});
  const cmd=(index,action,key,payload,entityId=null,expectedVersion='absent')=>({
    version:'cxorbia-command-adapter-v1',commandType:'finance.account.'+action,entityType:'financeAccount',
    tenantId,projectId:projectIds[index],periodId:periods[index],requireProject:true,requirePeriod:true,
    entityId,expectedVersion,idempotencyKey:key,authorization:{providerEnforcementRequired:true,
      permission:action==='create'?'finance.account.write':'finance.account.apply'},payload
  });
  const accountPath=id=>'tenants/'+tenantId+'/financeAccounts/'+id;
  const debt={kind:'cxc',concepto:'Saldo sintético',amount:12,country:'PA',currency:'PAB'};
  const first=await provider.execute('finance-fixture',cmd(0,'create','qa-one',debt));
  const second=await provider.execute('finance-fixture',cmd(1,'create','qa-two',{...debt,country:'CR',currency:'CRC'}));
  assert.ok(first.providerAck && second.providerAck,JSON.stringify([first,second]));
  const alienBefore=read(accountPath(second.entityId));
  const baseline=records();
  const attempts=[
    [cmd(0,'apply','qa-scope',{accountId:second.entityId,amount:2},second.entityId,second.account.updatedAt),'FINANCE_ACCOUNT_SCOPE_CONFLICT'],
    [cmd(1,'create','qa-currency',{...debt,country:'CR'}),'FINANCE_ACCOUNT_CURRENCY_SCOPE_CONFLICT']
  ];
  for(const [attempt,code] of attempts){
    const denied=await provider.execute('finance-fixture',attempt);
    assert.equal(denied.code,code);assert.equal(denied.providerWrites,0);
    assert.deepEqual(records(),baseline);
  }
  const apply=cmd(0,'apply','qa-own',{accountId:first.entityId,amount:2},first.entityId,first.account.updatedAt);
  const result=await provider.execute('finance-fixture',apply);
  assert.ok(result.providerAck,JSON.stringify(result));
  assert.equal(read(accountPath(first.entityId)).balance,10);
  assert.deepEqual(read(accountPath(second.entityId)),alienBefore);
  const after=records();
  const replay=await provider.execute('finance-fixture',apply);
  assert.ok(replay.idempotentReplay);assert.equal(replay.providerWrites,0);assert.deepEqual(records(),after);
  return {syntheticAccounts:2, currencies:['PAB','CRC'], foreignProjectDebitRejected:true,
    wrongCurrencyRejected:true, initialBalance:12, ownBalanceAfter:10, otherBalanceAfter:12,
    replayWrites:0, bankOperations:0};
}

async function main() {
  const providerPath = 'backend/runtime/cxorbia-project-command-provider-v1.mjs';
  const {createProjectCommandProvider} = await import('data:text/javascript;base64,'+blob(providerPath).toString('base64'));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(),'cx-intake-'));
  const file = path.join(temp,'records.sqlite');
  const fixtureDb = documentFixture(file);
  const roster = ['admin','shopper'];
  const auth = {async verifyIdToken(actor) {
    assert.ok(roster.includes(actor));
    return {uid:actor,tenantId,role:actor,authNamespace:actor==='admin'?'staff':'shopper'};
  }};
  const provider = createProjectCommandProvider({auth, db:fixtureDb.providerDb, policy});
  let reader, report;
  try {
    const fixtures = [
      {name:'QA Programa Interior',countries:['PA'],modelo:'directo',questionnaire:'interna',external:false},
      {name:'QA Programa Exterior',countries:['CR','PA'],modelo:'delegado',questionnaire:'externo_visita',external:true}];
    const created = [];
    for (const fixture of fixtures) await wizard(fixture,provider,created);
    assert.equal(created.length, 2);
    assert.notEqual(created[0].ack.projectId,created[1].ack.projectId);
    reader = new DatabaseSync(file,{readOnly:true});
    const records = () => reader.prepare('SELECT path, body FROM records ORDER BY path').all();
    const read = key => JSON.parse(reader.prepare('SELECT body FROM records WHERE path=?').get(key).body);
    const periods = [];
    for (const [i,{command,ack}] of created.entries()) {
      const f=fixtures[i], root='tenants/'+tenantId+'/projects/'+ack.projectId;
      const project=read(root);
      assert.equal(project.name,f.name);
      assert.equal(project.client,f.name);
      assert.deepEqual(project.countries,f.countries);
      assert.equal(project.modelo,f.modelo);
      assert.equal(project.cuestionario.modo,f.questionnaire);
      assert.deepEqual(project.ventanas,['Primera','Segunda']);
      assert.deepEqual(project.scenarios,['Control','Seguimiento']);
      assert.equal(project.pago.diasPago,21);
      assert.deepEqual(project.currency,i?{CR:'CRC',PA:'PAB'}:{PA:'PAB'});
      for (const [n,c] of f.countries.entries()) {
        assert.equal(project.honorario[c],13+n);
        assert.equal(project.honRecibe[c],29+n);
      }
      const src=project.operationalSource;
      assert.equal(src.mode,f.external?'external':'internal');
      assert.equal(src.writePolicy,f.external?'external_read_only':'platform_only');
      if(f.external) assert.deepEqual(src.countryBindings,f.countries.map(c=>({
        countryCode:c,providerBindingId:'qa-book-'+c,mappingRef:'qa-map-'+c})));
      const period=await provider.execute('admin',{commandType:'period.create',tenantId,projectId:ack.projectId,
        expectedVersion:'absent',payload:{name:'Enero QA'},idempotencyKey:'period:'+ack.projectId});
      assert.ok(period.readbackVerified);
      assert.equal(read(root+'/periods/'+period.periodId).projectId,ack.projectId);
      periods.push(period.periodId);
      const before=records();
      const replay=await provider.execute('admin',command);
      assert.ok(replay.idempotentReplay);
      assert.equal(replay.providerWrites,0);
      assert.equal((await provider.execute('shopper',{...command,idempotencyKey:'denied-'+i})).code,'PROJECT_ACTOR_DENIED');
      assert.equal((await provider.execute('admin',{...command,tenantId:'qa-other'})).code,'PROJECT_TENANT_SCOPE_DENIED');
      assert.deepEqual(records(),before);
    }
    assert.notEqual(...periods);
    const financialIsolation=await checkFinancialIsolation({created,periods,db:fixtureDb.providerDb,read,records});
    const intakeExamples=created.map(({command})=>{
      const {name,client,countries,currency,modelo,honorario,honRecibe,cuestionario,operationalSource,
        frecuencia,periodoMedicion,ventanas,scenarios,pago}=command.payload;
      return {name,client,countries,currency,modelo,honorario,honRecibe,cuestionario,operationalSource,
        frecuencia,periodoMedicion,ventanas,scenarios,pago};
    });
    report={intakeExamples,financialIsolation,scope:'ISOLATED_WIZARD_FIELDS_REAL_COMMAND_BOUNDARY_PROJECT_PROVIDER_SQLITE_DOUBLE',source,
      instrument:"Node VM, HTML field fixture (lxml), SQLite",wizardSubmissions:2,isolatedWizardContexts:2,projects:created.map(x=>x.ack.projectId),
      distinctPeriodsWithSameLabel:periods, independentReadConnection:true, replayWrites:0,
      deniedShopperCreates:2, deniedTenantCreates:2, externalRequests:0, makeCredits:0,
      physicalDevAcceptance:false};
  } finally {
    reader?.close(); fixtureDb.close();
    fs.rmSync(temp,{recursive:true,force:true});
  }
  assert.equal(fs.existsSync(temp),false);
  console.log(JSON.stringify({...report,cleanupVerified:true},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
