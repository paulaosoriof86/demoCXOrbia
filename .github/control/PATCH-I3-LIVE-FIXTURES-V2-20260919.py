#!/usr/bin/env python3
import gzip
from pathlib import Path

src_path=Path(".github/control/RECOVERY-I3-LIVE-FIXTURES-20260919.mjs.gz")
out_path=Path(".tmp/i3-live-fixtures-v2.mjs")
s=gzip.decompress(src_path.read_bytes()).decode("utf-8")

def exact(old,new,label):
    global s
    n=s.count(old)
    if n!=1:
        raise SystemExit(f"RELEASE_COMPOSITION_FAILURE:{label}:count={n}")
    s=s.replace(old,new,1)

exact(
"""    { testId: '3_NOMBRE_TILDE', key: 'i3-accent-' + RUN_ID, profile: { firstName: 'César', lastName: 'Castillo', nombre: 'César Castillo', whatsapp: '+50255550102', phone: '+50255550102', pais: 'GT', country: 'GT', email: '', estado: 'Activo', sourceType: 'platform', createdVia: 'live-fixture' } },""",
"""    { testId: '3_NOMBRE_TILDE', key: 'i3-accent-' + RUN_ID, profile: { firstName: 'César', lastName: 'CastilloI3' + suffix, nombre: 'César CastilloI3' + suffix, whatsapp: '+50255550102', phone: '+50255550102', pais: 'GT', country: 'GT', email: '', estado: 'Activo', sourceType: 'platform', createdVia: 'live-fixture' } },""",
"ACCENT_FIXTURE"
)

exact(
"""  if (accent.credential.login !== 'cesar.castillo' || accent.credential.password !== 'Cesar123*') throw new Error('FUNCTIONAL_DEFECT:ACCENT_CREDENTIAL_RULE');""",
"""  const exactAccent = shopperModule.shopperCredentialRule({ firstName: 'César', lastName: 'Castillo', nombre: 'César Castillo' });
  if (!exactAccent.ok || exactAccent.login !== 'cesar.castillo' || exactAccent.password !== 'Cesar123*') throw new Error('FUNCTIONAL_DEFECT:ACCENT_CREDENTIAL_RULE_EXACT_OWNER');
  if (!accent.credential.login.startsWith('cesar.castilloi3') || accent.credential.password !== 'Cesar123*') throw new Error('FUNCTIONAL_DEFECT:ACCENT_CREDENTIAL_RULE_LIVE_FIXTURE');""",
"ACCENT_ASSERT"
)

exact(
"""    const expected = f.testId === '3_NOMBRE_TILDE' ? { login: 'cesar.castillo', password: 'Cesar123*' } : f.testId === '4_NOMBRE_COMPUESTO' ? { login: f.credential.login, rule: 'first name + first surname only' } : { country: f.profile.pais, phone: f.profile.whatsapp, emailOptional: true };""",
"""    const expected = f.testId === '3_NOMBRE_TILDE' ? { exactCanonicalLogin: 'cesar.castillo', liveLogin: f.credential.login, password: 'Cesar123*', accentRemoved: true } : f.testId === '4_NOMBRE_COMPUESTO' ? { login: f.credential.login, rule: 'first name + first surname only' } : { country: f.profile.pais, phone: f.profile.whatsapp, emailOptional: true };""",
"ACCENT_EXPECTED"
)

old_login="""async function visibleShopperLogin(f) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  try {
    await page.goto(productUrl(), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => !!window.firebase?.auth && Array.isArray(window.firebase?.apps) && window.firebase.apps.length > 0, null, { timeout: 90000 });
    await page.locator('.role-btn[data-role="shopper"]').click({ timeout: 30000 });
    await page.locator('#lgUser').fill(f.credential.login);
    await page.locator('#lgPass').fill(f.credential.password);
    await page.locator('#lgSubmit').click();
    await page.waitForFunction(({ tenantId, projectId, shopperId }) => {
      const c = window.CX?.backendAuth?.context?.() || {};
      const ps = Array.isArray(c.projectIds) ? c.projectIds.map(String) : [];
      return c.authenticated === true && c.role === 'shopper' && c.tenantId === tenantId && String(c.shopperId || '') === shopperId && (ps.length === 0 || ps.includes(projectId));
    }, { tenantId: TENANT, projectId: PROJECT_ID, shopperId: f.id }, { timeout: 120000 });
    await page.waitForFunction(() => window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true, null, { timeout: 150000 });
    return await page.evaluate(() => {
      const c = window.CX?.backendAuth?.context?.() || {};
      const p = window.CX?.data?.__sessionShopperProfile || {};
      return { role: c.role, tenantId: c.tenantId, projectIds: c.projectIds || [], shopperId: c.shopperId,
        authority: window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true,
        profile: { id: p.id || p.shopperId || null, country: p.pais || p.country || null, phone: p.whatsapp || p.phone || null, email: p.email || '', status: p.estado || null } };
    });
  } finally { await context.close(); }
}"""
new_login="""async function visibleShopperLogin(f) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const diag = async (stage) => {
    try {
      return await page.evaluate((stage) => {
        const c=window.CX?.backendAuth?.context?.()||{}, u=window.firebase?.auth?.().currentUser||null, p=window.CX?.data?.__sessionShopperProfile||{};
        return {stage,firebaseUser:Boolean(u),firebaseUid:u?String(u.uid):'',context:{authenticated:c.authenticated===true,role:String(c.role||''),tenantId:String(c.tenantId||''),shopperId:String(c.shopperId||''),projectIds:Array.isArray(c.projectIds)?c.projectIds.map(String):[]},selectedRole:String(window.CX?.backendAuth?.selectedRole?.()||''),authError:String(document.querySelector('#cxIntegratedAuthError')?.innerText||document.querySelector('#lgError')?.innerText||'').slice(0,240),authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY||null,boot:window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE||null,gate:window.CX_C6_HR_AUTHORITY_GATE||null,source:String(window.CX?.dataSource?.sourceRef||''),sessionProfile:{id:String(p.id||p.shopperId||''),country:String(p.pais||p.country||''),phone:String(p.whatsapp||p.phone||''),email:String(p.email||'')}};
      }, stage);
    } catch (e) { return {stage,evaluateError:str(e?.message||e)}; }
  };
  try {
    await page.goto(productUrl(), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => !!window.firebase?.auth && Array.isArray(window.firebase?.apps) && window.firebase.apps.length > 0, null, { timeout: 90000 });
    await page.locator('.role-btn[data-role="shopper"]').click({ timeout: 30000 });
    await page.locator('#lgUser').fill(f.credential.login);
    await page.locator('#lgPass').fill(f.credential.password);
    await page.locator('#lgSubmit').click();
    try {
      await page.waitForFunction(({ tenantId, projectId, shopperId }) => {
        const c = window.CX?.backendAuth?.context?.() || {};
        const ps = Array.isArray(c.projectIds) ? c.projectIds.map(String) : [];
        return c.authenticated === true && c.role === 'shopper' && c.tenantId === tenantId && String(c.shopperId || '') === shopperId && (ps.length === 0 || ps.includes(projectId));
      }, { tenantId: TENANT, projectId: PROJECT_ID, shopperId: f.id }, { timeout: 60000 });
    } catch (e) {
      throw new Error('AUTH_FAILURE:VISIBLE_SHOPPER_CONTEXT:' + f.testId + ':' + JSON.stringify(await diag('context-timeout')).slice(0,1400));
    }
    try {
      await page.waitForFunction(() => window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true, null, { timeout: 150000 });
    } catch (e) {
      throw new Error('FUNCTIONAL_DEFECT:SHOPPER_HR_AUTHORITY_NOT_RELEASED:' + f.testId + ':' + JSON.stringify(await diag('hr-authority-timeout')).slice(0,1800));
    }
    return await page.evaluate(() => {
      const c = window.CX?.backendAuth?.context?.() || {};
      const p = window.CX?.data?.__sessionShopperProfile || {};
      return { role: c.role, tenantId: c.tenantId, projectIds: c.projectIds || [], shopperId: c.shopperId,
        authority: window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true,
        profile: { id: p.id || p.shopperId || null, country: p.pais || p.country || null, phone: p.whatsapp || p.phone || null, email: p.email || '', status: p.estado || null } };
    });
  } finally { await context.close(); }
}"""
exact(old_login,new_login,"VISIBLE_LOGIN_BLOCK")

role_click="""    await page.locator('.role-btn[data-role="shopper"]').click({ timeout: 30000 });"""
role_ready="""    await page.waitForFunction(() => typeof window.CX?.backendAuth?.selectedRole === 'function' && window.CX?.app?.__firebaseBrowserAuthWrapped === true && window.CX?.app?.__c6SingleFormRoleGuard === true && document.querySelector('#loginForm')?.__cxSingleFormAuthBound === true && window.CX_TYA_C6_UNIFIED_RUNTIME?.ready === true && window.CX_C6_SHOPPER_AUTH_CLICK_GUARD?.installed === true, null, { timeout: 45000 });
    await page.waitForTimeout(750);
    await page.waitForFunction(() => document.querySelector('#loginForm')?.__cxSingleFormAuthBound === true && typeof window.CX?.backendAuth?.selectedRole === 'function', null, { timeout: 15000 });
    await page.locator('.role-btn[data-role="shopper"]').click({ timeout: 30000 });
    await page.waitForFunction(() => window.CX?.backendAuth?.selectedRole?.() === 'shopper' && document.querySelector('#loginForm')?.dataset?.selectedRole === 'shopper', null, { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.waitForFunction(() => window.CX?.backendAuth?.selectedRole?.() === 'shopper' && document.querySelector('#loginForm')?.dataset?.selectedRole === 'shopper', null, { timeout: 5000 });"""
role_count=s.count(role_click)
if role_count!=2:
    raise SystemExit(f"RELEASE_COMPOSITION_FAILURE:SHOPPER_ROLE_CLICK_COUNT:{role_count}")
s=s.replace(role_click,role_ready)

admin_ensure="""    await p.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});"""
admin_restore="""    await p.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForFunction((uid) => String(window.firebase?.auth?.().currentUser?.uid || '') === uid, uid, { timeout: 90000 });
    await p.waitForFunction(() => typeof window.CX?.backendAuth?.context === 'function' && window.CX?.app?.__firebaseBrowserAuthWrapped === true, null, { timeout: 90000 });"""
admin_count=s.count(admin_ensure)
if admin_count!=1:
    raise SystemExit(f"RELEASE_COMPOSITION_FAILURE:ADMIN_ENSURE_COUNT:{admin_count}")
s=s.replace(admin_ensure,admin_restore,1)

exact(
"""    await page.waitForFunction(({ tenantId, projectId, shopperId }) => { const c=window.CX?.backendAuth?.context?.()||{}, ps=Array.isArray(c.projectIds)?c.projectIds.map(String):[]; return c.authenticated===true&&c.role==='shopper'&&c.tenantId===tenantId&&String(c.shopperId||'')===shopperId&&(ps.length===0||ps.includes(projectId)); }, { tenantId:TENANT, projectId:PROJECT_ID, shopperId:f.id }, { timeout:120000 });
    await page.waitForFunction(() => window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true, null, { timeout:150000 });""",
"""    try {
      await page.waitForFunction(({ tenantId, projectId, shopperId }) => { const c=window.CX?.backendAuth?.context?.()||{}, ps=Array.isArray(c.projectIds)?c.projectIds.map(String):[]; return c.authenticated===true&&c.role==='shopper'&&c.tenantId===tenantId&&String(c.shopperId||'')===shopperId&&(ps.length===0||ps.includes(projectId)); }, { tenantId:TENANT, projectId:PROJECT_ID, shopperId:f.id }, { timeout:60000 });
    } catch (e) {
      const d=await page.evaluate(()=>({firebaseUid:String(window.firebase?.auth?.().currentUser?.uid||''),context:window.CX?.backendAuth?.context?.()||null,authError:String(document.querySelector('#cxIntegratedAuthError')?.innerText||'').slice(0,240)}));
      throw new Error('AUTH_FAILURE:SHOPPER_VISIT_CONTEXT:' + f.testId + ':' + JSON.stringify(d).slice(0,1200));
    }
    try { await page.waitForFunction(() => window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true, null, { timeout:150000 }); }
    catch (e) {
      const d=await page.evaluate(()=>({authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY||null,boot:window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE||null,gate:window.CX_C6_HR_AUTHORITY_GATE||null,source:String(window.CX?.dataSource?.sourceRef||'')}));
      throw new Error('FUNCTIONAL_DEFECT:SHOPPER_VISIT_HR_AUTHORITY_NOT_RELEASED:' + f.testId + ':' + JSON.stringify(d).slice(0,1600));
    }""",
"SHOPPER_VISIT_WAITS"
)

s=s.replace("cxorbia.i3.live-fixtures.v1","cxorbia.i3.live-fixtures.v2",1)
s=s.replace("PASS_I3_LIVE_FIXTURES","PASS_I3_LIVE_FIXTURES_V2")
s=s.replace("HOLD_I3_LIVE_FIXTURES","HOLD_I3_LIVE_FIXTURES_V2")
required=["1_SHOPPER_GT","2_SHOPPER_HN","3_NOMBRE_TILDE","4_NOMBRE_COMPUESTO","5_PERFIL_ADMIN","6_HISTORICO_KPIS","7_DISPONIBILIDAD_ASIGNACION","8_POSTULACION","9_RESERVA","10_CLIENTE"]
for x in required:
    if x not in s: raise SystemExit("RELEASE_COMPOSITION_FAILURE:MISSING_TEST_ID:"+x)
out_path.parent.mkdir(parents=True,exist_ok=True)

hr_block="""  const hrResp = await fetch(HOST + '/api/tenants/' + encodeURIComponent(TENANT) + '/projects/' + encodeURIComponent(PROJECT_ID) + '/hr-live?' + new URLSearchParams({ format: 'json', fresh: '1', view: 'operational-names', cxOperationalPreview: FULL, ts: String(Date.now()) }), { cache: 'no-store', headers: { 'cache-control': 'no-store' } });
  const hrPayload = await hrResp.json();
  if (!hrResp.ok) throw new Error('PROVIDER_FAILURE:HR_LIVE_FOR_FIXTURE_' + hrResp.status);
  const hr = hrPayload.snapshot || hrPayload.data || hrPayload;
"""
if s.count(hr_block)!=1:
    raise SystemExit(f"RELEASE_COMPOSITION_FAILURE:HR_WARM_BLOCK:count={s.count(hr_block)}")
s=s.replace(hr_block,"",1)
staff_anchor="  const staffToken = await customTokenToIdToken(await auth.createCustomToken(staff.id), apiKey);\n"
if s.count(staff_anchor)!=1:
    raise SystemExit(f"RELEASE_COMPOSITION_FAILURE:STAFF_TOKEN_ANCHOR:count={s.count(staff_anchor)}")
s=s.replace(staff_anchor,staff_anchor+"\n"+hr_block,1)

out_path.write_text(s,encoding="utf-8")
print("PATCH_I3_LIVE_FIXTURES_V2_OK",len(s))
