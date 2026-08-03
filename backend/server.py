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
