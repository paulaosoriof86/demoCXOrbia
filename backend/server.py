"""TyA Consultores API - FastAPI backend."""
import os
import uuid
import logging
from pathlib import Path
from typing import List, Optional

from fastapi import (
    FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, Form as FForm,
    Header, Query, Response,
)
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from models import (
    UserCreate, UserUpdate, UserPublic, LoginRequest, LoginResponse,
    ClientIn, Client, PointOfSaleIn, PointOfSale, FormIn, Form,
    CampaignIn, Campaign, VisitIn, VisitUpdate, Visit,
    FileRecord, ChatRequest, DocAnalysisRequest, User,
    Tenant, TenantIn, Project, ProjectIn, Period, PeriodIn,
    Shopper, ShopperIn, ProjectShopper, Postulation, PostulationIn,
    Assignment, Liquidation, LiquidationIn,
    new_id, now_iso,
)
from auth import (
    hash_password, verify_password, create_token, get_current_user,
    require_roles,
)
from storage_util import init_storage, put_object, get_object, APP_NAME
from email_util import send_email, welcome_html
from ai_util import stream_chatbot, analyze_document
from seed_data import seed

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Mongo
client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="TyA Consultores API")
api = APIRouter(prefix="/api")


def strip_id(doc):
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc


# ==================== HEALTH ====================
@api.get("/")
async def root():
    return {"service": "TyA Consultores", "status": "ok"}


# ==================== AUTH ====================
@api.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    doc = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if not doc or not doc.get("active", True):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if not verify_password(body.password, doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = create_token(doc["id"], doc["email"], doc["role"])
    pub = {k: v for k, v in doc.items() if k != "password_hash"}
    return LoginResponse(access_token=token, user=UserPublic(**pub))


@api.get("/auth/me", response_model=UserPublic)
async def me(user=Depends(get_current_user)):
    doc = await db.users.find_one({"id": user["sub"]}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return UserPublic(**doc)


# ==================== USERS ====================
@api.get("/users", response_model=List[UserPublic])
async def list_users(_=Depends(require_roles("admin", "coordinador", "supervisor"))):
    docs = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return [UserPublic(**d) for d in docs]


@api.post("/users", response_model=UserPublic)
async def create_user(
    body: UserCreate,
    background_email: bool = Query(True),
    _=Depends(require_roles("admin")),
):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = User(
        email=email, full_name=body.full_name, role=body.role,
        phone=body.phone, active=body.active,
        password_hash=hash_password(body.password),
    )
    await db.users.insert_one(user.model_dump())
    if background_email:
        await send_email(
            email, "Bienvenido a TyA Consultores",
            welcome_html(body.full_name, email, body.password),
            reply_to=os.environ.get("OWNER_EMAIL"),
        )
    d = user.model_dump()
    d.pop("password_hash", None)
    return UserPublic(**d)


@api.patch("/users/{user_id}", response_model=UserPublic)
async def update_user(user_id: str, body: UserUpdate, _=Depends(require_roles("admin"))):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if "password" in update:
        update["password_hash"] = hash_password(update.pop("password"))
    if update:
        await db.users.update_one({"id": user_id}, {"$set": update})
    doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="No encontrado")
    return UserPublic(**doc)


# ==================== CLIENTS ====================
@api.get("/clients", response_model=List[Client])
async def list_clients(user=Depends(get_current_user)):
    docs = await db.clients.find({}, {"_id": 0}).to_list(500)
    return [Client(**d) for d in docs]


@api.post("/clients", response_model=Client)
async def create_client(body: ClientIn, _=Depends(require_roles("admin", "coordinador"))):
    c = Client(**body.model_dump())
    await db.clients.insert_one(c.model_dump())
    return c


# ==================== POINTS OF SALE ====================
@api.get("/points-of-sale", response_model=List[PointOfSale])
async def list_pos(client_id: Optional[str] = None, user=Depends(get_current_user)):
    q = {"client_id": client_id} if client_id else {}
    docs = await db.points_of_sale.find(q, {"_id": 0}).to_list(1000)
    return [PointOfSale(**d) for d in docs]


@api.post("/points-of-sale", response_model=PointOfSale)
async def create_pos(body: PointOfSaleIn, _=Depends(require_roles("admin", "coordinador"))):
    p = PointOfSale(**body.model_dump())
    await db.points_of_sale.insert_one(p.model_dump())
    return p


# ==================== FORMS ====================
@api.get("/forms", response_model=List[Form])
async def list_forms(user=Depends(get_current_user)):
    docs = await db.forms.find({}, {"_id": 0}).to_list(500)
    return [Form(**d) for d in docs]


@api.get("/forms/{form_id}", response_model=Form)
async def get_form(form_id: str, user=Depends(get_current_user)):
    doc = await db.forms.find_one({"id": form_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Formulario no encontrado")
    return Form(**doc)


@api.post("/forms", response_model=Form)
async def create_form(body: FormIn, user=Depends(require_roles("admin", "coordinador"))):
    f = Form(**body.model_dump(), created_by=user["sub"])
    await db.forms.insert_one(f.model_dump())
    return f


@api.put("/forms/{form_id}", response_model=Form)
async def update_form(form_id: str, body: FormIn, _=Depends(require_roles("admin", "coordinador"))):
    existing = await db.forms.find_one({"id": form_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="No encontrado")
    updated = {**existing, **body.model_dump()}
    await db.forms.update_one({"id": form_id}, {"$set": updated})
    return Form(**updated)


# ==================== CAMPAIGNS ====================
@api.get("/campaigns", response_model=List[Campaign])
async def list_campaigns(user=Depends(get_current_user)):
    docs = await db.campaigns.find({}, {"_id": 0}).to_list(500)
    return [Campaign(**d) for d in docs]


@api.get("/campaigns/{cid}", response_model=Campaign)
async def get_campaign(cid: str, user=Depends(get_current_user)):
    doc = await db.campaigns.find_one({"id": cid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")
    return Campaign(**doc)


@api.post("/campaigns", response_model=Campaign)
async def create_campaign(body: CampaignIn, user=Depends(require_roles("admin", "coordinador"))):
    c = Campaign(**body.model_dump(), created_by=user["sub"])
    await db.campaigns.insert_one(c.model_dump())
    return c


@api.patch("/campaigns/{cid}", response_model=Campaign)
async def patch_campaign(cid: str, body: CampaignIn, _=Depends(require_roles("admin", "coordinador"))):
    update = body.model_dump()
    await db.campaigns.update_one({"id": cid}, {"$set": update})
    doc = await db.campaigns.find_one({"id": cid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="No encontrada")
    return Campaign(**doc)


# ==================== VISITS ====================
@api.get("/visits", response_model=List[Visit])
async def list_visits(
    campaign_id: Optional[str] = None,
    auditor_id: Optional[str] = None,
    status: Optional[str] = None,
    user=Depends(get_current_user),
):
    q = {}
    if campaign_id:
        q["campaign_id"] = campaign_id
    if auditor_id:
        q["auditor_id"] = auditor_id
    if status:
        q["status"] = status
    # If auditor, only own visits
    if user.get("role") == "auditor":
        q["auditor_id"] = user["sub"]
    docs = await db.visits.find(q, {"_id": 0}).sort("scheduled_at", 1).to_list(1000)
    return [Visit(**d) for d in docs]


@api.get("/visits/{vid}", response_model=Visit)
async def get_visit(vid: str, user=Depends(get_current_user)):
    doc = await db.visits.find_one({"id": vid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    return Visit(**doc)


@api.post("/visits", response_model=Visit)
async def create_visit(body: VisitIn, _=Depends(require_roles("admin", "coordinador"))):
    v = Visit(**body.model_dump())
    await db.visits.insert_one(v.model_dump())
    return v


@api.patch("/visits/{vid}", response_model=Visit)
async def update_visit(vid: str, body: VisitUpdate, user=Depends(get_current_user)):
    existing = await db.visits.find_one({"id": vid}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="No encontrada")
    update = {k: v for k, v in body.model_dump().items() if v is not None}

    # Compute scores if answers provided
    if "answers" in update:
        form_doc = None
        camp = await db.campaigns.find_one({"id": existing["campaign_id"]}, {"_id": 0})
        if camp:
            form_doc = await db.forms.find_one({"id": camp["form_id"]}, {"_id": 0})
        total = 0.0
        max_s = 0.0
        if form_doc:
            weights = {q["id"]: q.get("weight", 1) for s in form_doc.get("sections", []) for q in s.get("questions", [])}
            for a in update["answers"]:
                w = weights.get(a.get("question_id"), 0)
                max_s += w * 5  # scale of 5
                # Auto-score simple cases
                val = a.get("value")
                score = a.get("score", 0)
                if score == 0 and val is not None:
                    if val is True or (isinstance(val, str) and val.lower() in ("si", "sí", "yes")):
                        score = w * 5
                    elif isinstance(val, (int, float)):
                        try:
                            score = min(float(val), 5) * w
                        except Exception:
                            score = 0
                a["score"] = score
                total += score
        update["total_score"] = round(total, 2)
        update["max_score"] = round(max_s, 2)
        update["percentage"] = round((total / max_s * 100) if max_s else 0, 2)

    if update.get("status") == "completada" and not existing.get("executed_at"):
        update["executed_at"] = now_iso()
    if update.get("status") == "auditada":
        update["audited_at"] = now_iso()
        update["audited_by"] = user["sub"]

    await db.visits.update_one({"id": vid}, {"$set": update})
    doc = await db.visits.find_one({"id": vid}, {"_id": 0})
    return Visit(**doc)


# ==================== DASHBOARD ====================
@api.get("/dashboard/stats")
async def dashboard_stats(user=Depends(get_current_user)):
    total_campaigns = await db.campaigns.count_documents({})
    active_campaigns = await db.campaigns.count_documents({"status": "activa"})
    total_visits = await db.visits.count_documents({})
    completed = await db.visits.count_documents({"status": {"$in": ["completada", "auditada"]}})
    pending = await db.visits.count_documents({"status": "planificada"})
    in_progress = await db.visits.count_documents({"status": "en_curso"})

    # Avg score of audited visits
    pipe = [
        {"$match": {"status": {"$in": ["completada", "auditada"]}, "percentage": {"$gt": 0}}},
        {"$group": {"_id": None, "avg": {"$avg": "$percentage"}}},
    ]
    avg_cursor = db.visits.aggregate(pipe)
    avg_docs = await avg_cursor.to_list(1)
    avg_score = round(avg_docs[0]["avg"], 1) if avg_docs else 0

    # Recent visits
    recent = await db.visits.find({}, {"_id": 0}).sort("created_at", -1).limit(6).to_list(6)

    return {
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "total_visits": total_visits,
        "completed_visits": completed,
        "pending_visits": pending,
        "in_progress_visits": in_progress,
        "compliance_rate": round((completed / total_visits * 100) if total_visits else 0, 1),
        "avg_score": avg_score,
        "recent_visits": recent,
    }


# ==================== FILES / STORAGE ====================
@api.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    context: Optional[str] = FForm(None),
    user=Depends(get_current_user),
):
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{user['sub']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    try:
        result = put_object(path, data, file.content_type or "application/octet-stream")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Storage error: {e}")
    rec = FileRecord(
        storage_path=result["path"],
        original_filename=file.filename,
        content_type=file.content_type or "application/octet-stream",
        size=result.get("size", len(data)),
        uploaded_by=user["sub"],
        context=context,
    )
    await db.files.insert_one(rec.model_dump())
    return rec


@api.get("/files/{file_id}")
async def get_file_meta(file_id: str, user=Depends(get_current_user)):
    doc = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="No encontrado")
    return doc


@api.get("/files/{file_id}/download")
async def download_file(
    file_id: str,
    authorization: Optional[str] = Header(None),
    auth: Optional[str] = Query(None),
):
    from auth import decode_token
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    elif auth:
        token = auth
    if not token or not decode_token(token):
        raise HTTPException(status_code=401, detail="No autenticado")
    doc = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="No encontrado")
    data, ctype = get_object(doc["storage_path"])
    return Response(content=data, media_type=doc.get("content_type", ctype))


# ==================== AI ====================
@api.post("/ai/chat/stream")
async def ai_chat_stream(body: ChatRequest, user=Depends(get_current_user)):
    async def gen():
        # persist user message
        await db.ai_messages.insert_one({
            "id": new_id(), "session_id": body.session_id, "user_id": user["sub"],
            "role": "user", "content": body.message, "created_at": now_iso(),
        })
        parts = []
        async for chunk in stream_chatbot(body.session_id, body.message):
            parts.append(chunk)
            yield chunk
        # persist assistant reply
        await db.ai_messages.insert_one({
            "id": new_id(), "session_id": body.session_id, "user_id": user["sub"],
            "role": "assistant", "content": "".join(parts), "created_at": now_iso(),
        })

    return StreamingResponse(
        gen(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@api.get("/ai/chat/history")
async def ai_chat_history(session_id: str, user=Depends(get_current_user)):
    docs = await db.ai_messages.find(
        {"session_id": session_id, "user_id": user["sub"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    return docs


@api.post("/ai/analyze")
async def ai_analyze(body: DocAnalysisRequest, user=Depends(get_current_user)):
    doc = await db.files.find_one({"id": body.file_id, "is_deleted": False}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    prompt_map = {
        "extract_form_data": f"Extraé todos los campos y valores del documento '{doc['original_filename']}'. Devolvé JSON válido.",
        "summarize": f"Resumí ejecutivamente el reporte '{doc['original_filename']}'. Incluí hallazgos, riesgos y recomendaciones. Contexto adicional: {body.context or 'N/A'}",
        "ocr": f"Realizá OCR sobre '{doc['original_filename']}' y devolvé el texto detectado.",
        "transcribe": f"Transcribí el audio '{doc['original_filename']}' con marcas temporales aproximadas.",
    }
    prompt = prompt_map.get(body.intent, "Analizá el documento.")
    result = await analyze_document(f"analyze-{doc['id']}", body.intent, prompt)
    await db.ai_analyses.insert_one({
        "id": new_id(), "file_id": doc["id"], "intent": body.intent,
        "result": result, "user_id": user["sub"], "created_at": now_iso(),
    })
    return {"intent": body.intent, "file_id": doc["id"], "result": result}


# ==================== EMAIL ====================
@api.post("/notify/test-email")
async def test_email(user=Depends(require_roles("admin"))):
    to = os.environ.get("OWNER_EMAIL", "delivered@resend.dev")
    return await send_email(
        to, "Test - Plataforma TyA",
        welcome_html("Paula", to, "(test - no aplica)"),
    )


# =========================================================================
# GRAVICENTRA CX — Multi-tenant routes (Fase A)
# =========================================================================
@api.get("/tenants", response_model=List[Tenant])
async def list_tenants(user=Depends(get_current_user)):
    docs = await db.tenants.find({}, {"_id": 0}).to_list(100)
    return [Tenant(**d) for d in docs]


@api.get("/tenants/{tid}", response_model=Tenant)
async def get_tenant(tid: str, user=Depends(get_current_user)):
    doc = await db.tenants.find_one({"id": tid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Tenant no encontrado")
    return Tenant(**doc)


@api.post("/tenants", response_model=Tenant)
async def create_tenant(body: TenantIn, _=Depends(require_roles("super_admin"))):
    t = Tenant(**body.model_dump())
    await db.tenants.insert_one(t.model_dump())
    return t


@api.get("/projects", response_model=List[Project])
async def list_projects(tenant_id: Optional[str] = None, user=Depends(get_current_user)):
    q = {"tenant_id": tenant_id} if tenant_id else {}
    docs = await db.projects.find(q, {"_id": 0}).to_list(200)
    return [Project(**d) for d in docs]


@api.get("/projects/{pid}", response_model=Project)
async def get_project(pid: str, user=Depends(get_current_user)):
    doc = await db.projects.find_one({"id": pid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return Project(**doc)


@api.post("/projects", response_model=Project)
async def create_project(body: ProjectIn, user=Depends(require_roles("admin"))):
    p = Project(**body.model_dump(), created_by=user["sub"])
    await db.projects.insert_one(p.model_dump())
    return p


@api.patch("/projects/{pid}", response_model=Project)
async def update_project(pid: str, body: ProjectIn, _=Depends(require_roles("admin"))):
    await db.projects.update_one({"id": pid}, {"$set": body.model_dump()})
    doc = await db.projects.find_one({"id": pid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="No encontrado")
    return Project(**doc)


@api.get("/periods", response_model=List[Period])
async def list_periods(project_id: Optional[str] = None, tenant_id: Optional[str] = None,
                       user=Depends(get_current_user)):
    q = {}
    if project_id: q["project_id"] = project_id
    if tenant_id: q["tenant_id"] = tenant_id
    docs = await db.periods.find(q, {"_id": 0}).sort("start_date", -1).to_list(500)
    return [Period(**d) for d in docs]


@api.post("/periods", response_model=Period)
async def create_period(body: PeriodIn, _=Depends(require_roles("admin", "coordinador"))):
    p = Period(**body.model_dump())
    await db.periods.insert_one(p.model_dump())
    return p


# ---------- SHOPPERS ----------
@api.get("/shoppers", response_model=List[Shopper])
async def list_shoppers(tenant_id: Optional[str] = None, country: Optional[str] = None,
                        q: Optional[str] = None, user=Depends(get_current_user)):
    query = {}
    if tenant_id: query["tenant_id"] = tenant_id
    if country: query["country"] = country
    if q:
        query["$or"] = [
            {"full_name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.shoppers.find(query, {"_id": 0}).sort("full_name", 1).to_list(500)
    return [Shopper(**d) for d in docs]


@api.get("/shoppers/{sid}")
async def get_shopper(sid: str, user=Depends(get_current_user)):
    doc = await db.shoppers.find_one({"id": sid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Shopper no encontrado")
    # Enriched: include ProjectShopper links + recent postulations
    links = await db.project_shoppers.find({"shopper_id": sid}, {"_id": 0}).to_list(50)
    postulations = await db.postulations.find({"shopper_id": sid}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return {"shopper": doc, "project_links": links, "postulations": postulations}


@api.post("/shoppers", response_model=Shopper)
async def create_shopper(body: ShopperIn, _=Depends(require_roles("admin", "coordinador"))):
    s = Shopper(**body.model_dump())
    await db.shoppers.insert_one(s.model_dump())
    return s


# ---------- POSTULATIONS ----------
@api.get("/postulations")
async def list_postulations(
    tenant_id: Optional[str] = None, project_id: Optional[str] = None,
    period_id: Optional[str] = None, shopper_id: Optional[str] = None,
    status: Optional[str] = None, user=Depends(get_current_user),
):
    query = {}
    for k, v in [("tenant_id", tenant_id), ("project_id", project_id),
                 ("period_id", period_id), ("shopper_id", shopper_id), ("status", status)]:
        if v: query[k] = v
    docs = await db.postulations.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    # enrich with shopper name
    shopper_ids = list({d["shopper_id"] for d in docs})
    shoppers = await db.shoppers.find({"id": {"$in": shopper_ids}}, {"_id": 0}).to_list(500)
    smap = {s["id"]: s for s in shoppers}
    for d in docs:
        s = smap.get(d["shopper_id"])
        d["shopper_name"] = s["full_name"] if s else None
        d["shopper_country"] = s.get("country") if s else None
        d["shopper_city"] = s.get("city") if s else None
    return docs


@api.post("/postulations", response_model=Postulation)
async def create_postulation(body: PostulationIn, user=Depends(get_current_user)):
    p = Postulation(**body.model_dump())
    await db.postulations.insert_one(p.model_dump())
    return p


@api.patch("/postulations/{pid}", response_model=Postulation)
async def review_postulation(
    pid: str, decision: str, reason: Optional[str] = None,
    user=Depends(require_roles("admin", "coordinador", "supervisor")),
):
    if decision not in ("approved", "rejected", "under_review"):
        raise HTTPException(status_code=400, detail="Decisión inválida")
    update = {
        "status": decision,
        "reviewed_by": user["sub"],
        "reviewed_at": now_iso(),
        "rejection_reason": reason if decision == "rejected" else None,
    }
    await db.postulations.update_one({"id": pid}, {"$set": update})
    doc = await db.postulations.find_one({"id": pid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="No encontrada")
    return Postulation(**doc)


# ---------- HR SYNC (stub read-only) ----------
@api.post("/hr/sync/{project_id}")
async def hr_sync(project_id: str, user=Depends(require_roles("admin", "coordinador"))):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    cfg = project.get("hr_config", {})
    if cfg.get("source_type") != "google_sheets" or not cfg.get("sheet_id"):
        return {
            "status": "not_configured",
            "message": "El proyecto no tiene Google Sheet configurado en hr_config.sheet_id",
            "project_id": project_id,
            "hint": "PATCH /api/projects/{id} con hr_config.sheet_id",
        }
    # In production this would read the actual sheet via Google API using service account creds.
    # For now we record the sync attempt as syncEvent (audit-friendly stub).
    ev_id = new_id()
    await db.sync_events.insert_one({
        "id": ev_id, "direction": "hr_to_platform", "entity": "visits",
        "project_id": project_id, "tenant_id": project["tenant_id"],
        "sheet_id": cfg["sheet_id"], "sheet_tabs": cfg.get("sheet_tabs", {}),
        "status": "simulated_ok", "rows_processed": 0,
        "created_at": now_iso(),
    })
    return {
        "status": "simulated_ok",
        "sync_event_id": ev_id,
        "project_id": project_id,
        "message": "Sincronización simulada. Configurar credenciales Google API en fase de deployment real.",
    }


@api.get("/hr/sync-events")
async def list_sync_events(project_id: Optional[str] = None, user=Depends(get_current_user)):
    q = {"project_id": project_id} if project_id else {}
    docs = await db.sync_events.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs


# ---------- LIQUIDATIONS ----------
@api.get("/liquidations")
async def list_liquidations(project_id: Optional[str] = None, period_id: Optional[str] = None,
                            status: Optional[str] = None, user=Depends(get_current_user)):
    q = {}
    for k, v in [("project_id", project_id), ("period_id", period_id), ("status", status)]:
        if v: q[k] = v
    docs = await db.liquidations.find(q, {"_id": 0}).to_list(500)
    return docs


@api.post("/liquidations", response_model=Liquidation)
async def create_liquidation(body: LiquidationIn, _=Depends(require_roles("admin"))):
    total = body.honorarium + sum((body.reimbursements or {}).values())
    liq = Liquidation(**body.model_dump(), total=total)
    await db.liquidations.insert_one(liq.model_dump())
    return liq


# Wire router
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        init_storage()
    except Exception as e:
        logger.error(f"storage init failed: {e}")
    try:
        await seed(db)
    except Exception as e:
        logger.exception(f"seed failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    client.close()
